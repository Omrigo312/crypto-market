const COINS_API_URL = 'https://api.coingecko.com/api/v3/coins';
const COINS_INFO_API_URL = 'https://api.coingecko.com/api/v3/coins/';
const TWO_MINS = 1000 * 60 * 2;
const MAX_COINS_TO_TRACK = 5;
let allCoins = {};
let coinsToTrack = [];
let stagingCoinsToTrack = [];

$(document).ready(() => {
  $('#coinBoard').css('margin-top', $('.navbar').height());
  displayCoinCards();
  navbarActiveState();
});

function displayCoinCards() {
  $('#coinsRow').empty();
  if (allCoins) {
    for (let coin of Object.values(allCoins)) {
      const coinCard = createCoinCard(coin);
      $('#coinsRow').append(coinCard);
    }
  }
  $.get(COINS_API_URL)
    .then(function (data) {
      for (let coin of data) {
        allCoins[coin.symbol] = coin;
        const coinCard = createCoinCard(coin);
        $('#coinsRow').append(coinCard);
      }
    })
    .catch((msg) => console.error(msg));
}

function onSearchButtonClicked() {
  searchedTerm = $('#searchBar').prop('value');
  if (!searchedTerm) {
    return displayCoinCards();
  }
  for (let [id, coinData] of Object.entries(allCoins)) {
    if (searchedTerm == coinData.symbol) {
      return showSearchResult(id, coinData);
    }
  }
}

function showSearchResult(id = null, data = null) {
  if (data) {
    $('#coinsRow').empty();
    const coinCard = createCoinCard(data);
    $('#coinsRow').append(coinCard);
    $('#coinsRow').append(
      `<div class="mt-2 col-12"><button class="btn btn-primary" onclick="displayCoinCards()">Show All Coins</button></div>`
    );
    if (coinsToTrack.includes(id)) {
      handleCheckBox(id, true);
    }
  }
}

function createCoinCard(coinData) {
  const { symbol, name } = coinData;
  const coinCard = `
  <div class="coin-card card col-12 col-md-6 col-lg-3 left "> 
    <div class="card-body">
      <div class="d-flex justify-content-between">
        <h5 class="card-title">${symbol.toUpperCase()}</h5>
        <input type="checkbox" id="${symbol}Switch" class="${symbol}Switch" onclick="trackCoin(this, '${symbol}')" /><label
          for="${symbol}Switch"
        ></label>
      </div>
      <p class="card-text">${name}</p>
      <a
        data-toggle="collapse"
        href="#${symbol}Collapse"
        role="button"
        aria-expanded="false"
        class="btn more-info-btn"
        onclick="onMoreInfoButtonClick(this, '${symbol}')"
      >More Info</a>
      <div class="collapse multi-collapse" id="${symbol}Collapse"></div>
    </div>
  </div>`;
  return coinCard;
}

function createCoinCardModal(coinData) {
  const { symbol, name } = coinData;
  const coinCard = `
  <div class="coin-card modal-card card col-12 col-md-6 col-lg-4 left "> 
    <div class="card-body">
      <div class="d-flex justify-content-between">
        <h5 class="card-title">${symbol.toUpperCase()}</h5>
        <input type="checkbox" id="${symbol}ModalSwitch" checked="checked" class="${symbol}Switch" onclick="trackCoin(this, '${symbol}')" /><label
          for="${symbol}ModalSwitch"
        ></label>
      </div>
      <p class="card-text">${name}</p>
    </div>
  </div>`;
  return coinCard;
}

function trackCoin(coinSwitch, id) {
  if (!$(coinSwitch).prop('checked')) {
    $('#confirmButton').prop('disabled', false);
    handleCheckBox(id, false);
    coinsToTrack.splice(coinsToTrack.indexOf(id), 1);
  } else {
    handleCheckBox(id, true);
    coinsToTrack.push(id);
    const modalOn = $('#coinsModal').hasClass('show');
    if (coinsToTrack.length > MAX_COINS_TO_TRACK) {
      if (!modalOn) {
        stagingCoinsToTrack = coinsToTrack.slice();
        displayModal();
      } else {
        $('#confirmButton').prop('disabled', true);
      }
    }
  }
}

function handleCheckBox(id, check) {
  $(`.${id}Switch`).each(function () {
    $(this).prop('checked', check);
  });
}

function displayModal() {
  $('#confirmButton').prop('disabled', true);
  $('#modalCoinsRow').empty();
  for (let coin of coinsToTrack) {
    const coinData = allCoins[coin];
    $('#modalCoinsRow').append(createCoinCardModal(coinData));
  }
  $('#coinsModal').modal();
}

function onCancelButtonClicked() {
  coinsToTrack = stagingCoinsToTrack;
  for (let coin of coinsToTrack) {
    handleCheckBox(coin, true);
  }
  handleCheckBox(coinsToTrack.pop(), false);
}

function onMoreInfoButtonClick(button, id) {
  const coinBox = $(button).closest('.card');
  const collapse = $(coinBox).find('.multi-collapse');
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

function showLiveReports() {
  let date = new Date();

  let option = {
    title: {
      text: 'Live Currencies',
    },
    data: [],
    toolTip: {
      shared: true,
    },
    legend: {
      cursor: 'pointer',
      itemclick: toggleDataSeries,
    },
    options: {
      scales: {
        xAxes: [
          {
            type: 'time',
            time: {
              displayFormats: {
                second: 'hh:mm:ss',
              },
            },
          },
        ],
      },
    },
  };
  $('#liveReports').CanvasJSChart(option);
  let coinsInStringFormat = commaSeparatedString();
  for (let coin of coinsToTrack) {
    option.data.push(creatNewData(coin));
  }
  updateData();
  var xValue = date;

  function addData(data) {
    for (let [index, coin] of coinsToTrack.entries()) {
      option.data[index].dataPoints.push({
        x: xValue,
        y: data[coin.toUpperCase()].USD,
      });
      if (option.data[index].dataPoints.length > 10) {
        option.data[index].dataPoints.splice(0, 1);
      }
    }
    xValue = new Date();
    $('#liveReports').CanvasJSChart().render();
    setTimeout(updateData, 2000);
  }

  function updateData() {
    $.getJSON(
      `https://min-api.cryptocompare.com/data/pricemulti?fsyms=${coinsInStringFormat}&tsyms=USD`,
      addData
    );
  }

  function toggleDataSeries(e) {
    if (typeof e.dataSeries.visible === 'undefined' || e.dataSeries.visible) {
      e.dataSeries.visible = false;
    } else {
      e.dataSeries.visible = true;
    }
    e.chart.render();
  }
}

function commaSeparatedString() {
  let result = '';
  for (let coin of coinsToTrack) {
    result += `${coin},`;
  }
  return result;
}

function creatNewData(id) {
  let dataPoints = [];
  let newData = {
    type: 'spline',
    name: id,
    showInLegend: true,
    xValueFormatString: 'hh:mm:ss',
    yValueFormatString: '#,##0.## $',
    dataPoints: dataPoints,
  };
  return newData;
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
  $('ul .link').on('click', function () {
    $('ul li').each(function () {
      if ($(this).hasClass('active')) {
        $(this).removeClass('active');
      }
    });
    $(this).addClass('active');
  });
}
