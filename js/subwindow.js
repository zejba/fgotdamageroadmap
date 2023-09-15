let win1;

function openSubWindow(url) {
  win1 = window.open(url, "result_window", "width=700,height=700,scrollbars=yes");
}
function cloneResult() {
  if (window.opener && !window.opener.closed) {
    let clone = window.opener.document.getElementsByClassName("resultform")[0].cloneNode(true);
    document.getElementsByClassName("resultform")[0].parentElement.appendChild(clone);
  } else {
    alert("元ウィンドウが存在しません。");
  }
}

function clickCalculate() {
  if (window.opener && !window.opener.closed) {
    window.opener.document.getElementById("calculate_button").click();
  } else {
    alert("元ウィンドウが存在しません。");
  }
}