// export default async function fetchPhoto(userSearch) {
//   const response = await fetch(
//     `https://pixabay.com/api/?key=29882224-53e6cb6eb5c61ad27904c20c4&q=${userSearch}&image_type=photo&orientation=horizontal&safesearch=true&per_page=40&`
//   );
//   const result = await response.json();
//   return result;
// }

const axios = require('axios');

export default async function fetchPhoto(userSearch, page) {
  try {
    const response = await axios.get(
      `https://pixabay.com/api/?key=29882224-53e6cb6eb5c61ad27904c20c4&q=${userSearch}&image_type=photo&orientation=horizontal&safesearch=true&per_page=40&page=${page}`
    );
    // console.log(response);
    const result = await response;
    return result;
  } catch (error) {
    // console.error(error);
    console.log(error);
  }
}
