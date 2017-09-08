const mongoose = require('mongoose');

mongoose.Promise = global.Promise;
const slug = require('slugs');

const storeSchema = new mongoose.Schema({
  name: {
    type: String,
    trim: true,
    required: 'Please enter a store name.',
  },
  slug: String,
  description: {
    type: 'String',
    trim: true,
  },
  tags: [String],
  created: {
    type: Date,
    default: Date.now,
  },
  location: {
    type: {
      type: String,
      default: 'Point',
    },
    coordinates: [
      {
        type: Number,
        required: 'You must supply coordinates.',
      },
    ],
    address: {
      type: String,
      required: 'You must provide an address.',
    },
  },
  photo: String,
  author: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: 'You must provide an author.'
  }
}, {
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
storeSchema.index({
  name: 'text',
  description: 'text'
});

storeSchema.index({
  location: '2dsphere'
});

storeSchema.pre('save', async function (next) {
  if (!this.isModified('name')) {
    next(); // skip
    return; // stop fn
  }
  this.slug = slug(this.name);

  const slugRegex = new RegExp(`^(${this.slug})((-[0-9]*$)?)$`, 'i');

  const storesWithSlug = await this.constructor.find({ slug: slugRegex });

  if (storesWithSlug.length) {
    this.slug = `${this.slug}-${storesWithSlug.length + 1}`;
  }

  next();
});

storeSchema.statics.getTagsList = function getTagsList() {
  return this.aggregate([
    { $unwind: '$tags' },
    { $group: { _id: '$tags', count: { $sum: 1 } } },
    { $sort: { count: -1 } }
  ]);
};

storeSchema.statics.getTopStores = function getTopStores() {
  return this.aggregate([
    // Lookup stores and populate reviews
    { $lookup: { from: 'reviews', localField: '_id', foreignField: 'store', as: 'reviews' } },
    // filter for only stores with 2 or more reviews
    { $match: { 'reviews.1': { $exists: true } } },
    // add the avg reviews field ($addFields added in mongo 3.4, earlier used $project)
    { $addFields: {
      averageRating: { $avg: '$reviews.rating' }
    } },
    // sort by new avg field, highest reviews first
    { $sort: { averageRating: -1 } },
    // limit to 10
    { $limit: 10 }
  ]);
};

// Hmm...should have just used sql (virtual is a mongoose thing, not mongodb thing)
storeSchema.virtual('reviews', {
  ref: 'Review', // Model to link
  localField: '_id', // field on this model
  foreignField: 'store' // that equals this field
});

function autopopulate(next) {
  this.populate('reviews');
  next();
}

storeSchema.pre('find', autopopulate);
storeSchema.pre('findOne', autopopulate);

module.exports = mongoose.model('Store', storeSchema);
