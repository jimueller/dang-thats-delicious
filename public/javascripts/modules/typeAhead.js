import axios from 'axios';
import dompurify from 'dompurify';

const ENTER = 13;
const UP = 38;
const DOWN = 40;

function searchResultsHtml(stores) {
  return stores.map(store => {
    return `
      <a href="/store/${store.slug}" class="search__result">
        <strong>${store.name}</strong>
      </a>
    `;
  }).join('');
}

function typeAhead(search) {
  if(!search) return;
  
  const searchInput = search.querySelector('input[name="search"]');
  const searchResults = search.querySelector('.search__results');
  
  searchInput.on('input', function () {
    // if no value, quit
    if(!this.value) {
      searchResults.style.display = 'none';
      return;
    }
    
    // otherwise, show the results
    searchResults.style.display = 'block';
    
    axios
      .get(`/api/stores/search?q=${this.value}`)
      .then(res => {
        if(res.data.length){
          searchResults.innerHTML = dompurify.sanitize( searchResultsHtml(res.data));
          return;
        }
        
        // nothing found
        searchResults.innerHTML = dompurify.sanitize(`<div class="search__result">No results found</div>`);
      })
      .catch(err => {
        console.error(err);
      });
  });

  //handle keyboard inputs
  searchInput.on('keyup', (e) => {
    if(![UP, DOWN, ENTER].includes(e.keyCode)){
      return; // don't care
    }
    
    // wheel through results
    const activeClass = 'search__result--active';
    const current = search.querySelector(`.${activeClass}`);
    const items = document.querySelectorAll('.search__result');
    let next;
    
    if(e.keyCode === DOWN && current){
      next = current.nextElementSibling || items[0];
    } else if (e.keyCode === DOWN){
      next = items[0];
    } else if (e.keyCode === UP && current){
      next = current.previousElementSibling || items[items.length -1];
    } else if (e.keyCode === UP){
      next = items[items.length -1];
    } else if (e.keyCode === ENTER && current.href){
      window.location = current.href;
      return;
    }
    
    if(current){
      current.classList.remove(activeClass);
    }
    next.classList.add(activeClass);
  });
}

export default  typeAhead;