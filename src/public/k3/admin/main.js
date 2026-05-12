const socket = io();

$(window).on("load", function () {
  setTimeout(() => {
    $("#preloader").fadeOut(0);
  }, 100);
});
$(document).ready(function () {
  $(`a[href="${window.location.pathname}"]`).addClass("active");
  $(`a[href="${window.location.pathname}"]`).css("pointerEvents", "none");
});

$(".back-to-tops").click(function () {
  $("html, body").animate(
    {
      scrollTop: 0,
    },
    800,
  );
  return false;
});

const isNumber = (params) => {
  let pattern = /^[0-9]*\d$/;
  return pattern.test(params);
};

function formatMoney(money) {
  return String(money).replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1.");
}

function cownDownTimer() {
  var countDownDate = new Date("2030-07-16T23:59:59.9999999+01:00").getTime();
  setInterval(function () {
    let checkID = $("html").attr("data-change");
    var now = new Date().getTime();
    var distance = countDownDate - now;
    var minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    var minute = Math.ceil(minutes % Number(checkID));
    var seconds1 = Math.floor((distance % (1000 * 60)) / 10000);
    var seconds2 = Math.floor(((distance % (1000 * 60)) / 1000) % 10);
    if (checkID != 1) {
      $(".time .time-sub:eq(1)").text(minute);
    }

    $(".time .time-sub:eq(2)").text(seconds1);
    $(".time .time-sub:eq(3)").text(seconds2);
  }, 0);
}

cownDownTimer();

// -------------------------------------------------------------------------------------

function showListOrder(datas) {
  let html = "";

  datas.map((data) => {
    let list_kq = "";
    let total = 0;
    String(data.result)
      .split("")
      .forEach((e) => {
        total += Number(e);
        list_kq += `<span data-v-a9660e98="" class="red box-xs"> ${e} </span>`;
      });
    html += `
        <tr>
            <td>${data.period}</td>
            <td>
                ${list_kq}
                <span class="text-red" style="font-weight: 800; margin-left: 8px;">= ${total}</span>
            </td>
            <td><span class="${total >= 3 && total <= 10 ? "text-green" : "text-red"}">${total >= 3 && total <= 10 ? "Small" : "Big"}</span></td>
            <td><span class="${total % 2 == 0 ? "text-red" : "text-green"}">${total % 2 == 0 ? "Even" : "Odd"}</span></td>
        </tr>
        `;
  });
  $("#list-orders").html(html);
}

function messNewJoin2(datas) {
  let result = "";
  datas.map((data) => {
    if (data.typeGame == "total") {
      result += `
                <div class="direct-chat-infos clearfix mt-2">
                    <span class="direct-chat-name float-left"></span>
                </div>
                <img class="direct-chat-img" src="/images/myimg.png" alt="user">
                <div class="direct-chat-text" style="background-color: var(--accent)"> Join Total (${data.bet}) <span style="margin-left: 8px; font-weight: 800;">₹${data.money}</span></div>
            `;
    }
    if (data.typeGame == "three-same") {
      result += `
                <div class="direct-chat-infos clearfix mt-2">
                    <span class="direct-chat-name float-left"></span>
                </div>
                <img class="direct-chat-img" src="/images/myimg.png" alt="user">
                <div class="direct-chat-text" style="background-color: var(--accent)"> Join 3 same numbers(${data.bet}) <span style="margin-left: 8px; font-weight: 800;">₹${data.money}</span></div>
            `;
    }

    if (data.typeGame == "two-same") {
      result += `
                <div class="direct-chat-infos clearfix mt-2">
                    <span class="direct-chat-name float-left"></span>
                </div>
                <img class="direct-chat-img" src="/images/myimg.png" alt="user">
                <div class="direct-chat-text" style="background-color: var(--accent)"> Join 2 same numbers(${data.bet}) <span style="margin-left: 8px; font-weight: 800;">₹${data.money}</span></div>
            `;
    }
    if (data.typeGame == "unlike") {
      result += `
                <div class="direct-chat-infos clearfix mt-2">
                    <span class="direct-chat-name float-left"></span>
                </div>
                <img class="direct-chat-img" src="/images/myimg.png" alt="user">
                <div class="direct-chat-text" style="background-color: var(--accent)"> Join another number(${data.bet}) <span style="margin-left: 8px; font-weight: 800;">₹${data.money}</span></div>
            `;
    }
  });
  $(".direct-chat-msg").html(result);
  $(".direct-chat-warning .direct-chat-messages").animate(
    {
      scrollTop: $(".direct-chat-msg").prop("scrollHeight"),
    },
    750,
  );
}

function messNewJoin3(datas) {
  let total = 0;
  let twoSame = 0;
  let threeSame = 0;
  let unlike = 0;
  datas.map((data) => {
    let typeGame = data.typeGame;
    if (typeGame == "total") {
      total += data.money;
      $(`#total`).attr("totalMoney", total);
      $(`#total`).text(total);
    }
    if (typeGame == "two-same") {
      twoSame += data.money;
      $(`#2-so-trung`).attr("totalMoney", twoSame);
      $(`#2-so-trung`).text(twoSame);
    }
    if (typeGame == "three-same") {
      threeSame += data.money;
      $(`#3-so-trung`).attr("totalMoney", threeSame);
      $(`#3-so-trung`).text(threeSame);
    }
    if (typeGame == "unlike") {
      unlike += data.money;
      $(`#khac-so`).attr("totalMoney", unlike);
      $(`#khac-so`).text(unlike);
    }
  });
}

function callListOrder() {
  let game = $("html").attr("data-change");
  $.ajax({
    type: "POST",
    url: "/api/webapi/admin/k3/listOrders",
    data: {
      gameJoin: game,
    },
    dataType: "json",
    success: function (response) {
      showListOrder(response.data.gameslist);
      messNewJoin2(response.bet);
      // messNewJoin3(response.bet);
      let settings = response.settings[0];
      if (game == 1)
        $("#ketQua").text(
          "next result: " + `${settings.k3d == "-1" ? "Random" : settings.k3d}`,
        );
      if (game == 3)
        $("#ketQua").text(
          "next result: " +
            `${settings.k3d3 == "-1" ? "Random" : settings.k3d3}`,
        );
      if (game == 5)
        $("#ketQua").text(
          "next result: " +
            `${settings.k3d5 == "-1" ? "Random" : settings.k3d5}`,
        );
      if (game == 10)
        $("#ketQua").text(
          "next result: " +
            `${settings.k3d10 == "-1" ? "Random" : settings.k3d10}`,
        );
      $(".reservation-chunk-sub-num").text(response.period);
      $("#preloader").fadeOut(0);
    },
  });
}
callListOrder();
socket.on("data-server-k3", function (msg) {
  if (msg) {
    callListOrder();
    $(".direct-chat-msg").html("");
  }
});

function messNewJoin(data) {
  console.log("K3 Admin received data:", data);
  let game = $("html").attr("data-change");
  // if (data.change == 1) return; // Commented out for testing so admin bets also show
  if (data.game != game) {
    console.log("Game mismatch:", data.game, "expected:", game);
    return;
  }

  let typeGame = "";
  if (data.gameJoin == 1) typeGame = "total";
  if (data.gameJoin == 2) typeGame = "two-same";
  if (data.gameJoin == 3) typeGame = "three-same";
  if (data.gameJoin == 4) typeGame = "unlike";
  let result = "";

  if (typeGame == "total") {
    result += `
            <div class="direct-chat-infos clearfix mt-2">
                <span class="direct-chat-name float-left"></span>
            </div>
            <img class="direct-chat-img" src="/images/myimg.png" alt="user">
            <div class="direct-chat-text" style="background-color: var(--accent)"> Join Total(${data.listJoin}) <span style="margin-left: 8px; font-weight: 800;">₹${Number(data.money) * Number(data.xvalue)}</span></div>
        `;
  }
  if (typeGame == "three-same") {
    result += `
            <div class="direct-chat-infos clearfix mt-2">
                <span class="direct-chat-name float-left"></span>
            </div>
            <img class="direct-chat-img" src="/images/myimg.png" alt="user">
            <div class="direct-chat-text" style="background-color: var(--accent)"> Join 3 same numbers(${data.listJoin}) <span style="margin-left: 8px; font-weight: 800;">₹${Number(data.money) * Number(data.xvalue)}</span></div>
        `;
  }

  if (typeGame == "two-same") {
    result += `
            <div class="direct-chat-infos clearfix mt-2">
                <span class="direct-chat-name float-left"></span>
            </div>
            <img class="direct-chat-img" src="/images/myimg.png" alt="user">
            <div class="direct-chat-text" style="background-color: var(--accent)"> Join 2 same numbers(${data.listJoin}) <span style="margin-left: 8px; font-weight: 800;">₹${Number(data.money) * Number(data.xvalue)}</span></div>
        `;
  }
  if (typeGame == "unlike") {
    result += `
            <div class="direct-chat-infos clearfix mt-2">
                <span class="direct-chat-name float-left"></span>
            </div>
            <img class="direct-chat-img" src="/images/myimg.png" alt="user">
            <div class="direct-chat-text" style="background-color: var(--accent)"> Join another number(${data.listJoin}) <span style="margin-left: 8px; font-weight: 800;">₹${Number(data.money) * Number(data.xvalue)}</span></div>
        `;
  }
  $(".direct-chat-msg").append(result);
  $(".direct-chat-messages").animate(
    {
      scrollTop: $(".direct-chat-msg").prop("scrollHeight"),
    },
    750,
  );
}

function messNewJoin5(data) {
  let game = $("html").attr("data-change");
  if (data.change == 1) return;
  if (data.game != game) return;
  let typeGame = "";
  if (data.gameJoin == 1) typeGame = "total";
  if (data.gameJoin == 2) typeGame = "two-same";
  if (data.gameJoin == 3) typeGame = "three-same";
  if (data.gameJoin == 4) typeGame = "unlike";

  if (typeGame == "total") {
    let money =
      Number($(`#total`).attr("totalMoney")) +
      Number(data.money) * Number(data.xvalue);
    $(`#total`).attr("totalMoney", money);
    $(`#total`).text(money);
  }
  if (typeGame == "two-same") {
    let money =
      Number($(`#2-so-trung`).attr("totalMoney")) +
      Number(data.money) * Number(data.xvalue);
    $(`#2-so-trung`).attr("totalMoney", money);
    $(`#2-so-trung`).text(money);
  }
  if (typeGame == "three-same") {
    let money =
      Number($(`#3-so-trung`).attr("totalMoney")) +
      Number(data.money) * Number(data.xvalue);
    $(`#3-so-trung`).attr("totalMoney", money);
    $(`#3-so-trung`).text(money);
  }
  if (typeGame == "unlike") {
    let money =
      Number($(`#khac-so`).attr("totalMoney")) +
      Number(data.money) * Number(data.xvalue);
    $(`#khac-so`).attr("totalMoney", money);
    $(`#khac-so`).text(money);
  }
}

socket.on("data-server-3", function (msg) {
  messNewJoin(msg);
  // messNewJoin5(msg);
});

$("#manage .game-tab").click(async function (e) {
  e.preventDefault();
  $("#preloader").fadeIn(0);
  let game = $(this).attr("data");
  $("html").attr("data-change", game);
  await callListOrder();
  $("#manage .game-tab").removeClass("block-click active-game");
  $(this).addClass("block-click active-game");
});

$(".start-order").click(function (e) {
  e.preventDefault();
  let value = $("#editResult").val();
  let game = $("html").attr("data-change");
  if (value != "") {
    $.ajax({
      type: "POST",
      url: "/api/webapi/admin/k3/editResult",
      data: {
        game: game,
        list: value,
      },
      dataType: "json",
      success: function (response) {
        Swal.fire("Good job!", `${response.message}`, "success");
        $("#ketQua").text("next result: " + value);
      },
    });
  } else {
    Swal.fire({
      icon: "error",
      title: "Oops...",
      text: "Something went wrong!",
    });
  }
});

