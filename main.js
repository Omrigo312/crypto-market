const COINS_API_URL = 'https://api.coingecko.com/api/v3/coins';

function fetchData() {
  $.get(COINS_API_URL)
    .then(function (data) {
      for (let coin of data) {
        for (let key of Object.keys(coin)) {
          // console.log(key, data[0][key]);
        }
      }
    })
    .catch((msg) => console.error(msg));
}

$(window).scroll(function () {
  if ($(window).scrollTop() >= 50) {
    $('.navbar').removeClass('navbar-transparent');
    $('.navbar').addClass('navbar-light');
  } else {
    $('.navbar').removeClass('navbar-light');
    $('.navbar').addClass('navbar-transparent');

  }
});

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

function moreInfo(button) {
  let coinBox = $(button).closest('.card');
  let collapse = $(coinBox).find('.multi-collapse');
  if (!collapse.attr('class').split(' ').includes('show')) {
    coinBox.removeClass('coin-box');
  } else {
    setTimeout(() => {
      coinBox.addClass('coin-box');
    }, 250);
  }
  console.log(coinBox.attr('class'));
}
