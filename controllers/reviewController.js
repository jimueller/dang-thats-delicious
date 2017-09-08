const mongoose = require('mongoose');

const Review = mongoose.model('Review');

exports.addReview = async (req, res) => {
  const { text, rating } = req.body;
  
  const review = new Review({
    text,
    rating,
    author: req.user.id,
    store: req.params.id
  });
  await review.save();
  req.flash('success', `Thanks for leaving a review`);
  res.redirect('back');
};