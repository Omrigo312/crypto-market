const COINS_API_URL = 'https://api.coingecko.com/api/v3/coins';

function fetchData() {
  $.get(COINS_API_URL)
    .then(function (data) {
      for (let coin of data) {
        for (let key of Object.keys(coin)) {
          console.log(key, data[0][key]);
        }
      }
    })
    .catch((msg) => console.error(msg));
}

$(document).ready(function () {
  fetchData();
  navbarActiveState();
});

function navbarActiveState() {
  $('ul li').on('click', function () {
    $('ul li').each(function () {
      if ($(this).hasClass('active')) {
        $(this).removeClass('active');
      }
    });
    $(this).addClass('active');
  });
}
