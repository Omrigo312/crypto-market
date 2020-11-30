const COINS_API_URL = 'https://api.coingecko.com/api/v3/coins';
const COINS_INFO_API_URL = 'https://api.coingecko.com/api/v3/coins/';
const TWO_MINS = 1000 * 60 * 2;
const MAX_COINS_TO_TRACK = 1;
let coinsToTrack = new Set();

$(document).ready(() => {
  $('#coinBoard').css('margin-top', $('.navbar').height());
  displayCoinCards();
  navbarActiveState();
  // $('#coinsModal').modal();
});

function displayCoinCards() {
  $.get(COINS_API_URL)
    .then(function (data) {
      for (let coin of data) {
        localStorage.setItem(coin.id, JSON.stringify(coin));
        const coinCard = createCoinCard(coin);
        $('#coinsRow').append(coinCard);
      }
    })
    .catch((msg) => console.error(msg));
}

function createCoinCard(coinData) {
  const { id, symbol, name } = coinData;
  const coinCard = `
  <div class="coin-card card col-12 col-md-6 col-lg-3 left "> 
    <div class="card-body">
      <div class="d-flex justify-content-between">
        <h5 class="card-title">${symbol.toUpperCase()}</h5>
        <input type="checkbox" id="${id}Switch" class="${id}Switch" onclick="trackCoin(this, '${id}')" /><label
          for="${id}Switch"
        ></label>
      </div>
      <p class="card-text">${name}</p>
      <a
        data-toggle="collapse"
        href="#${id}Collapse"
        role="button"
        aria-expanded="false"
        class="btn more-info-btn"
        onclick="onMoreInfoButtonPress(this, '${id}')"
      >More Info</a>
      <div class="collapse multi-collapse" id="${id}Collapse"></div>
    </div>
  </div>`;
  return coinCard;
}

function createCoinCardModal(coinData) {
  const { id, symbol, name } = coinData;
  const coinCard = `
  <div class="coin-card modal-card card col-12 col-md-6 col-lg-4 left "> 
    <div class="card-body">
      <div class="d-flex justify-content-between">
        <h5 class="card-title">${symbol.toUpperCase()}</h5>
        <input type="checkbox" id="${id}ModalSwitch" checked="checked" class="${id}Switch" onclick="trackCoin(this, '${id}')" /><label
          for="${id}ModalSwitch"
        ></label>
      </div>
      <p class="card-text">${name}</p>
    </div>
  </div>`;
  return coinCard;
}

function trackCoin(coinSwitch, id) {
  if ($(coinSwitch).attr('checked')) {
    handleCheckBox([id], false);
    coinsToTrack.delete(id);
  } else {
    handleCheckBox([id], true);
    coinsToTrack.add(id);
    if (
      coinsToTrack.size > MAX_COINS_TO_TRACK &&
      !$('#coinsModal').hasClass('show')
    ) {
      displayModal();
    }
  }
  console.log(coinsToTrack);
}

function handleCheckBox(ids, check) {
  for (let id of ids) {
    console.log($(`.${id}Switch`).length);
    $(`.${id}Switch`).each(function () {
      $(this).attr('checked', check);
    });
  }
}

function displayModal() {
  $('#modalCoinsRow').empty();
  for (let coin of coinsToTrack) {
    const coinData = JSON.parse(localStorage.getItem(coin));
    $('#modalCoinsRow').append(createCoinCardModal(coinData));
  }
  $('#coinsModal').modal();
}

function onMoreInfoButtonPress(button, id) {
  const coinBox = $(button).closest('.card');
  const collapse = $(coinBox).find('.multi-collapse');
  // const id = $(button).attr('id');
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
  // display loading gif
  collapseBox = $(`#${id}Collapse`);
  collapseBox.empty();
  collapseBox.append(
    `<div class="coin-info"><img class="gif" src="./assets/gifs/loading.gif" alt="Be patient..."</div>`
  );

  // Create coin info tab
  coinInfo = JSON.parse(sessionStorage.getItem(id));
  if (coinInfo) {
    createCoinInfoTab(coinInfo);
  } else {
    $.get(`${COINS_INFO_API_URL}${id}`)
      .then(function (fetchedCoinInfo) {
        sessionStorage.setItem(id, JSON.stringify(fetchedCoinInfo));
        createCoinInfoTab(fetchedCoinInfo);
        setTimeout(() => {
          sessionStorage.removeItem(id);
        }, TWO_MINS);
      })
      .catch((msg) => console.error(msg));
  }
}

function createCoinInfoTab(coinInfo) {
  const { usd, eur, ils } = coinInfo.market_data.current_price;
  const image = coinInfo.image.small;
  coinInfoBox = collapseBox.find('.coin-info');
  coinInfoBox.empty();
  coinInfoBox.append(
    ` <p>USD: ${usd} $<br />EUR: ${eur} &#8364<br />ILS: ${ils} &#8362</p>
    <img
      src="${image}" class="mt-2"
    />`
  );
}

// Navbar transparent when reaching top screen
$(window).scroll(() => {
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
