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
    data.result.split("").forEach((e) => {
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
            <td><span class="${total < 23 ? "text-green" : "text-red"}">${total < 23 ? "Small" : "Big"}</span></td>
            <td><span class="${total % 2 == 0 ? "text-red" : "text-green"}">${total % 2 == 0 ? "Even" : "Odd"}</span></td>
        </tr>
        `;
  });
  $("#list-orders").html(html);
}

function messNewJoin2(datas) {
  let result = "";
  datas.map((data) => {
    let list_join = data.bet.split(""); // là người dùng Join đặt cược
    let list_join2 = data.bet; // là người dùng Join đặt cược
    let x = data.amount; // là người dùng Join đặt cược

    let total_money = Number(data.money) * Number(x) * list_join.length;
    let money = formatMoney(total_money, ",");

    result += `
        <div class="direct-chat-infos clearfix mt-2">
            <span class="direct-chat-name float-left"></span>
        </div>
        <img class="direct-chat-img" src="/images/myimg.png" alt="user">
        <div class="direct-chat-text" style="background-color: var(--accent)">
            Join ${isNumber(list_join2) ? "( " + list_join2 + " )" : list_join2 == "b" ? "Big" : list_join2 == "s" ? "Small" : list_join2 == "c" ? "Even" : "Odd"} 
            <span style="margin-left: 8px; font-weight: 800;">₹${money}</span>
        </div>
        `;
  });
  $(".direct-chat-msg").html(result);
  $(".direct-chat-messages").animate(
    {
      scrollTop: $(".direct-chat-msg").prop("scrollHeight"),
    },
    750,
  );
}

function messNewJoin3(datas) {
  let arr = [
    "b",
    "s",
    "c",
    "l",
    "0",
    "1",
    "2",
    "3",
    "4",
    "5",
    "6",
    "7",
    "8",
    "9",
  ];

  for (let i = 0; i < arr.length; i++) {
    $(`#${arr[i]}`).attr("totalMoney", 0);
    $(`#${arr[i]}`).text(0);
  }

  datas.map((data) => {
    let bet = data.bet.split(""); // là người dùng Join đặt cược

    for (let i = 0; i < bet.length; i++) {
      let total_money = Number(data.money) / Number(bet.length);
      let totalM = Number($(`#${bet[i]}`).attr("totalMoney"));
      $(`#${bet[i]}`).attr("totalMoney", totalM + Number(total_money));
      $(`#${bet[i]}`).text(totalM + Number(total_money));
    }
  });
}

function callListOrder() {
  let game = $("html").attr("data-change");
  $.ajax({
    type: "POST",
    url: "/api/webapi/admin/5d/listOrders",
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
        $("#Result").text(
          "Next Result: " + `${settings.k5d == "-1" ? "Random" : settings.k5d}`,
        );
      if (game == 3)
        $("#Result").text(
          "Next Result: " +
            `${settings.k5d3 == "-1" ? "Random" : settings.k5d3}`,
        );
      if (game == 5)
        $("#Result").text(
          "Next Result: " +
            `${settings.k5d5 == "-1" ? "Random" : settings.k5d5}`,
        );
      if (game == 10)
        $("#Result").text(
          "Next Result: " +
            `${settings.k5d10 == "-1" ? "Random" : settings.k5d10}`,
        );
      $(".reservation-chunk-sub-num").text(response.period);
      $("#preloader").fadeOut(0);
    },
  });
}
callListOrder();
socket.on("data-server-5d", function (msg) {
  if (msg) {
    callListOrder();
    $(".direct-chat-msg").html("");
  }
});

function messNewJoin(data) {
  let game = $("html").attr("data-change");
  if (data.change == 1) return;
  if (data.game != game) return;

  let bet = data.join; // Join game ví dụ a b c d e tổng
  let list_join = data.list_join.split(""); // là người dùng Join đặt cược
  let list_join2 = data.list_join; // là người dùng Join đặt cược
  let x = data.x; // là người dùng Join đặt cược

  let total_money = Number(data.money) * Number(x) * list_join.length;
  let money = formatMoney(total_money, ",");
  let result = "";
  result += `
        <div class="direct-chat-infos clearfix mt-2">
           <span class="direct-chat-name float-left"></span>
        </div>
        <img class="direct-chat-img" src="/images/myimg.png" alt="user">
        <div class="direct-chat-text" style="background-color: var(--accent)">
           Join ${isNumber(list_join2) ? "( " + list_join2 + " )" : list_join2 == "b" ? "Big" : list_join2 == "s" ? "Small" : list_join2 == "c" ? "Even" : "Odd"}
           <span style="margin-left: 8px; font-weight: 800;">₹${money}</span>
        </div>
        `;
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

  let bet = data.list_join.split(""); // là người dùng Join đặt cược

  for (let i = 0; i < bet.length; i++) {
    let money = Number(data.money);
    let totalM = Number($(`#${bet[i]}`).attr("totalMoney"));
    $(`#${bet[i]}`).attr("totalMoney", totalM + money);
    $(`#${bet[i]}`).text(totalM + money);
  }
}

socket.on("data-server-5", function (msg) {
  messNewJoin(msg);
  console.log(msg);
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
      url: "/api/webapi/admin/5d/editResult",
      data: {
        game: game,
        list: value,
      },
      dataType: "json",
      success: function (response) {
        Swal.fire("Good job!", `${response.message}`, "success");
        $("#Result").text("Next Result: " + value);
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

