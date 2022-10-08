// import SimpleLightbox from 'simplelightbox';
// import 'simplelightbox/dist/simple-lightbox.min.css';

import './css/styles.css';
import Notiflix from 'notiflix';

import fetchPhoto from './fetchPhoto.js';

const refs = {
  formEl: document.querySelector('#search-form'),
  inputEl: document.querySelector('input'),
  galleryEl: document.querySelector('.gallery'),
  sentinelEl: document.querySelector('#sentinel'),
};

const { formEl, inputEl, galleryEl, sentinelEl } = refs;

let inputValue = '';
let page = 0;
let userSearch = '';
let totalHits = 0;
let hitsArr = [];

inputEl.addEventListener('input', onInput);

function onInput(event) {
  inputValue = event.currentTarget.value;
  return;
}

formEl.addEventListener('submit', onSubmit);

function onSubmit(event) {
  event.preventDefault();

  userSearch = inputValue;
  page = 1;
  if (!userSearch) {
    deletePhotoMarkup();
    return;
  }

  deletePhotoMarkup();
  fetchPhoto(userSearch, page)
    .then(search => {
      // console.log(search.data.hits);
      const dataHits = search.data.hits; //for filmoteka
      // const idFilm = search.data.hits.id;

      totalHits = search.data.totalHits;
      // console.log(totalHits);
      if (totalHits > 0) {
        Notiflix.Notify.info(`Hooray! We found ${totalHits} images.`);
        // return renderPhotoMarkup(search);
        renderPhotoMarkup(search);
        // scrollStart();

        // for Filmoteka

        // console.log(dataHits);
        addArrFilmsToLocalStorage(dataHits);
        addToQueueRemove();
        checkPresenceFilm();
      }
      hitsArr = search.data.hits;
      // console.log(hitsArr);
      if (!hitsArr.length) {
        return Notiflix.Notify.failure(
          'Sorry, there are no images matching your search query. Please try again.'
        );
      }
    })
    .catch(error => console.log(error));
}

// let photoCardEl = [];
let photoLinkEl = [];

function deletePhotoMarkup() {
  // ==============photoCardEl=============
  // photoCardEl = document.querySelectorAll('.photo-card');
  // console.log(photoCardEl.length);
  // photoCardEl?.forEach(element => element.remove());
  // ==============photoLinkEl=============
  photoLinkEl = document.querySelectorAll('.photo-link');
  // console.log(photoCardEl.length);
  photoLinkEl?.forEach(element => element.remove());
}

function renderPhotoMarkup(search) {
  hitsArr = search.data.hits;
  // checkPresenceFilm();
  const markupCard = hitsArr
    .map(
      hit =>
        `
      <a class="photo-link" href="">
        <img src="${hit.webformatURL}" alt="${hit.tags}" loading="lazy" width=300 height=200 />
        <div class="photo-card">
          <div class="info">
            <p class="info-item">
              <b>Likes</b><br>${hit.likes}
            </p>
            <p class="info-item">
              <b>Views</b><br>${hit.views}
            </p>
            <p class="info-item">
              <b>Comments</b><br>${hit.comments}
            </p>
            <p class="info-item">
              <b>Downloads</b><br>${hit.downloads}
            </p>
          </div>
          <button type="button" id="${hit.id}"class="btn-add-to-queue">Add to Queue</button> 
        </div>
      </a>`
    )
    .join('');

  galleryEl.insertAdjacentHTML('beforeend', markupCard);
  // galleryLightbox.refresh();
}
// =====================================================================================
// ======================================For filmoteka===============================================
// =====================================================================================

// inputEl: document.querySelector('input');
// inputEl.addEventListener('input', onInput);

function addArrFilmsToLocalStorage(arr) {
  console.log(arr);
  // const save = (Films, arr) => {
  try {
    const serializedState = JSON.stringify(arr);
    localStorage.setItem('Films', serializedState);
  } catch (error) {
    console.error('Set state error: ', error.message);
  }
}

// function addFilmToQueue(id) {}

// }
let idCurrentFilm;
let btnAddToQueueEl;

function addToQueueRemove() {
  btnAddToQueueEl = document.querySelector('.btn-add-to-queue');
  btnAddToQueueEl?.addEventListener('click', onAddQueue);

  // btnAddToQueueEl = document.querySelectorAll('.btn-add-to-queue');

  // btnAddToQueueEl.forEach(element => {
  //   element.addEventListener('click', onAddQueue);
  // });

  function onAddQueue(event) {
    event.preventDefault();

    let currentFilm = {}; //1)
    idCurrentFilm = Number(event.currentTarget.id);

    //0)Якщо фільм вже є у списку Черги
    if (btnAddToQueueEl.textContent === 'Remove from Queue') {
      btnAddToQueueEl.textContent = 'Add to Queue';
      btnAddToQueueEl.style.backgroundColor = 'green';

      //0.1) Дістаєм з локал сторедж список Черги
      // const savedFilmsInQueue = localStorage.getItem('FilmsArrQueue');
      // const parsedFilmsInQueue = JSON.parse(savedFilmsInQueue);
      const parsedFilmsInQueue = getArrQueueWithLocalStorage();

      //0.2)Перебираєм масив Черги з локал сторедж
      // і повертаєм фільм який потрібно видалити з списку
      let newArrFilms = parsedFilmsInQueue;
      parsedFilmsInQueue.map((film, index) => {
        if (film.id === idCurrentFilm) {
          // 0.3)Видаляєм з масиву поточний фільм
          newArrFilms.splice(index, 1);
          setArrQueueInLocalStorage(newArrFilms);
        }
        return;
      });

      return;
    }

    btnAddToQueueEl.textContent = 'Remove from Queue';
    btnAddToQueueEl.style.backgroundColor = 'red';

    // let currentFilm = {}; //1)
    // idCurrentFilm = Number(event.currentTarget.id);

    // 1) Дістаємо поточну сторінку фільмів з Локал сторедж
    const savedFilms = localStorage.getItem('Films');
    const parsedFilms = JSON.parse(savedFilms);
    // const parsedFilms = getArrQueueWithLocalStorage();

    // console.log(parsedFilms);

    parsedFilms.map(film => {
      //1.1)Перевіряєм чи поточний фільм id співпадає з id фільму з локал сторедж
      if (film.id === idCurrentFilm) {
        // console.log(film.id);
        // console.log(currentFilm);

        currentFilm = film;
        // console.log(currentFilm);
      }
      return;
    });

    // 2) Перевіряєм/дістаєм з локал сторедж Queue
    // const savedFilmsInQueue = localStorage.getItem('FilmsArrQueue');
    // const parsedFilmsInQueue = JSON.parse(savedFilmsInQueue);
    const parsedFilmsInQueue = getArrQueueWithLocalStorage();
    // console.log(parsedFilmsInQueue);

    // 2.1) Добавляєм в локал сторедж Queue якщо там пусто
    if (!parsedFilmsInQueue) {
      //якщо там пусто
      console.log('В FilmsArrQueue пусто');

      try {
        const serializedState = JSON.stringify([currentFilm]);
        localStorage.setItem('FilmsArrQueue', serializedState);
      } catch (error) {
        console.error('Set state error: ', error.message);
      }
    }
    // 2.2) Перевіряєм чи поточний фільм є у локал сторедж,
    // якщо так виводимо alert з повідомленням

    if (parsedFilmsInQueue) {
      // якщо там вже є інформація

      let newArrQueue = [];
      let boolPresentFilm = false;

      parsedFilmsInQueue.map(film => {
        if (film.id === idCurrentFilm) {
          boolPresentFilm = true;

          alert('Цей фільм вже є у списку');

          // btnAddToQueueEl.textContent = 'Remove from Queue';
          // btnAddToQueueEl.style.backgroundColor = 'red';
        }
        return;
      });
      // 2.3) Перевіряєм чи поточний фільм є у локал сторедж,
      // якщо ні добавляєм в локал сторедж Queue
      if (!boolPresentFilm) {
        try {
          newArrQueue = [...parsedFilmsInQueue, currentFilm];
          const newArrQueueString = JSON.stringify(newArrQueue);
          localStorage.setItem('FilmsArrQueue', newArrQueueString);
        } catch (error) {
          console.error('Set state error: ', error.message);
        }
      }
    }
  }
}

// 3) При загрузці фільмів перевіряє чи є цей фільм у Queue
// і робить кнопку червоною/зеленою
function checkPresenceFilm() {
  // const savedFilmsInQueue = localStorage.getItem('FilmsArrQueue');
  // const parsedFilmsInQueue = JSON.parse(savedFilmsInQueue);
  const parsedFilmsInQueue = getArrQueueWithLocalStorage();
  // console.log(btnAddToQueueEl);
  const btnAddToQueueEl = document.querySelector('.btn-add-to-queue');
  // console.log(btnAddToQueueEl.id);
  const idBtn = Number(btnAddToQueueEl.id);
  parsedFilmsInQueue.map(film => {
    if (film.id === idBtn) {
      // return (btnAddToQueueEl.textContent = 'Remove from Queue');
      btnAddToQueueEl.textContent = 'Remove from Queue';
      btnAddToQueueEl.style.backgroundColor = 'red';

      // alert('sdsfdsfsdfdfsdfs');
    }
  });
}

// 4) Рендерить сторінку при натисканні на кнопку Queue

const btnQueue = document.querySelector('.queue-btn');
// console.log(btnQueue);
btnQueue.addEventListener('click', onQueue);

function onQueue() {
  deletePhotoMarkup();
  //дістаємо з локал сторедж
  // const savedFilmsInQueue = localStorage.getItem('FilmsArrQueue');

  // const parsedFilmsInQueue = JSON.parse(savedFilmsInQueue);
  const parsedFilmsInQueue = getArrQueueWithLocalStorage();

  if (!parsedFilmsInQueue || parsedFilmsInQueue.length === 0) {
    return;
  }
  // рендер
  renderQueue(parsedFilmsInQueue);

  // 4.1) При загрузці фільмів перевіряє чи є цей фільм у Queue
  // і робить кнопку червоною/зеленою
  checkPresenceFilm();

  //Видаляєм фільм з локал сторедж
  addToQueueRemove();

  //4.2)Видалення картки i оновлення інтерфейсу
  const btnRemoveForQueueEl = document.querySelector('.btn-add-to-queue');
  btnRemoveForQueueEl?.addEventListener('click', onRemoveQueue);

  function onRemoveQueue(event) {
    event.preventDefault();
    deletePhotoMarkup();
    const arrQueueWithLocalStorage = getArrQueueWithLocalStorage();
    renderQueue(arrQueueWithLocalStorage);
  }
}
// 5) Рендер Queue
function renderQueue(arr) {
  const markupCard = arr
    .map(
      hit =>
        `
      <a class="photo-link" href="">
        <img src="${hit.webformatURL}" alt="${hit.tags}" loading="lazy" width=300 height=200 />
        <div class="photo-card">
          <div class="info">
            <p class="info-item">
              <b>Likes</b><br>${hit.likes}
            </p>
            <p class="info-item">
              <b>Views</b><br>${hit.views}
            </p>
            <p class="info-item">
              <b>Comments</b><br>${hit.comments}
            </p>
            <p class="info-item">
              <b>Downloads</b><br>${hit.downloads}
            </p>
          </div>
          <button type="button" id="${hit.id}"class="btn-add-to-queue">Add to Queue</button> 
        </div>
      </a>`
    )
    .join('');

  galleryEl.insertAdjacentHTML('beforeend', markupCard);
}
// 6) Set масиву фільмів у локал сторедж
function setArrQueueInLocalStorage(arr) {
  try {
    const serializedState = JSON.stringify(arr);
    localStorage.setItem('FilmsArrQueue', serializedState);
  } catch (error) {
    console.error('Set state error: ', error.message);
  }
}

// 7) Get масиву фільмів у локал сторедж
function getArrQueueWithLocalStorage() {
  // try {
  //   const savedFilmsInQueue = localStorage.getItem('FilmsArrQueue');
  //   const parsedFilmsInQueue = JSON.parse(savedFilmsInQueue);
  //   return parsedFilmsInQueue;
  // } catch (error) {
  //   console.error('Set state error: ', error.message);
  // }
  try {
    const serializedState = localStorage.getItem('FilmsArrQueue');
    return serializedState === null ? undefined : JSON.parse(serializedState);
  } catch (error) {
    console.error('Get state error: ', error.message);
  }
}

// =====================================================================================
// =====================================================================================
// =====================================================================================
// const galleryLightbox = new SimpleLightbox('.gallery a', {
//   captionsData: 'alt',
//   captionDelay: 250,
// });

// ========================================IntersectionObserver(Нескінченний скрол)=============================================

// const onEntry = entries => {
//   // console.log(entries);
//   entries.forEach(entry => {
//     if (entry.isIntersecting && userSearch !== '') {
//       // console.log('Пора грузити ще');

//       page += 1;
//       let numberPages = totalHits / 40;

//       if (page > Math.ceil(numberPages)) {
//         return Notiflix.Notify.failure(
//           "We're sorry, but you've reached the end of search results."
//         );
//       }

//       fetchPhoto(userSearch, page)
//         .then(search => {
//           // return renderPhotoMarkup(search);
//           renderPhotoMarkup(search);
//           scrollMore();
//         })
//         .catch(error => console.log(error));
//     }
//   });
// };

// const options = {
//   rootMargin: '200px',
// };
// const observer = new IntersectionObserver(onEntry, options);

// observer.observe(sentinelEl);

// // ============================================================================================================================
// function scrollStart() {
//   const { height: formHeight } = document
//     .querySelector('.search-form')
//     .firstElementChild.getBoundingClientRect();
//   // console.log('ScrollStart');

//   window.scrollBy({
//     top: formHeight * 1.2,
//     behavior: 'smooth',
//   });
// }

// function scrollMore() {
//   const { height: cardHeight } = document
//     .querySelector('.gallery')
//     .firstElementChild.getBoundingClientRect();
//   // console.log('ScrollMore');

//   window.scrollBy({
//     top: cardHeight * 2,
//     behavior: 'smooth',
//   });
// }
