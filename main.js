const COINS_API_URL = 'https://api.coingecko.com/api/v3/coins';
const COINS_INFO_API_URL = 'https://api.coingecko.com/api/v3/coins/';

function fetchData() {
  $.get(COINS_API_URL)
    .then(function (data) {
      for (let coin of data) {
        sessionStorage.setItem(coin.id, JSON.stringify(coin));
        createCoinCard(coin);
      }
    })
    .catch((msg) => console.error(msg));
}

function createCoinCard(coinData) {
  const { id, symbol, name } = coinData;
  $('#coinsRow').append(
    `<div class="coin-card card col-12 col-md-3 left "> 
      <div class="card-body">
        <div class="d-flex justify-content-between">
          <h5 class="card-title">${symbol.toUpperCase()}</h5>
          <input type="checkbox" id="${id}Switch" /><label
            for="${id}Switch"
          ></label>
        </div>
      <p class="card-text">${name}</p>
      <a
        data-toggle="collapse"
        href="#${id}Collapse"
        role="button"
        aria-expanded="false"
        class="btn btn-primary"
        id="${id}"
        onclick="onMoreInfoButtonPress(this)"
        >More Info</a
      >
      <div class="collapse multi-collapse" id="${id}Collapse">
        
      </div>
    </div>
  </div>`
  );
}

$(document).ready(function () {
  console.log( $('.navbar').height())
  $('#coinBoard').css('margin-top', $('.navbar').height());
  fetchData();
  navbarActiveState();
});

function onMoreInfoButtonPress(button) {
  let coinBox = $(button).closest('.card');
  let collapse = $(coinBox).find('.multi-collapse');
  const id = $(button).attr('id');
  const collapserClassArray = collapse.attr('class').split(' ');

  // Do nothing during collapse
  if (collapserClassArray.includes('collapsing')) {
    return;
  }

  // Ternary for showing \ not showing info
  if (!collapserClassArray.includes('show')) {
    coinBox.removeClass('coin-card');
    $(button).html('Less Info');
    displayCoinInfo(id);
  } else {
    $(button).html('More Info');
    setTimeout(() => {
      coinBox.addClass('coin-card');
    }, 250);
  }
}

// Loading and displaying coin info
function displayCoinInfo(id) {
  collapseBox = $(`#${id}Collapse`);
  collapseBox.empty();
  collapseBox.append(
    `<div class="coin-info"><img class="gif" src="./assets/gifs/loading.gif" alt="Be patient..."</div>`
  );
  $.get(`${COINS_INFO_API_URL}${id}`)
    .then(function (data) {
      const { usd, eur, ils } = data.market_data.current_price;
      coinInfoBox = collapseBox.find('.coin-info');
      coinInfoBox.empty();
      coinInfoBox.append(
        ` <p>USD: ${usd} $<br />EUR: ${eur} &#8364<br />ILS: ${ils} &#8362</p>
        <img
          src="${data.image.small}" class="mt-2"
        />`
      );
    })
    .catch((msg) => console.error(msg));
}

// Navbar transparent when reaching top screen
$(window).scroll(function () {
  if ($(window).scrollTop() >= 50) {
    $('.navbar').removeClass('navbar-transparent');
    $('.navbar').addClass('navbar-light');
  } else {
    $('.navbar').removeClass('navbar-light');
    $('.navbar').addClass('navbar-transparent');
  }
});

// Navbar buttons active state tracker
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
