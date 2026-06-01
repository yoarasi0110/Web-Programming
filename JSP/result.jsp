<%--設定 JSP 頁面的編碼方式--%>
<%@ page contentType="text/html; charset=UTF-8" pageEncoding="UTF-8" %>

<%--避免使用者輸入html特殊字元被執行--%>
<%!
  private String escHtml(String s) {
    if (s == null) return "";
    return s.replace("&", "&amp;")
            .replace("<", "&lt;")
            .replace(">", "&gt;")
            .replace("\"", "&quot;")
            .replace("'", "&#39;");
  }
%>

<%--取得表單資料--%>
<%
  <%--設定接收資料時使用 UTF-8避免中文亂碼--%>
  request.setCharacterEncoding("UTF-8");
  <%--取得欄位內容，分別為: 支出收入、金額、類別、日期、備註--%>
  String type = request.getParameter("type");
  String amount = request.getParameter("amount");
  String category = request.getParameter("category");
  String date = request.getParameter("date");
  String note = request.getParameter("note");

  <%--檢查資料是否完整--%>
  boolean ok = type != null && amount != null && category != null && date != null
      && !type.trim().isEmpty() && !amount.trim().isEmpty()
      && !category.trim().isEmpty() && !date.trim().isEmpty();

  double amountValue = 0;
  if (ok) {
    try {
      amountValue = Double.parseDouble(amount);
      <%--檢查金額是否為正數--%>
      if (amountValue <= 0) ok = false;
    } 
    <%--避免使用者輸入非數字內容--%>
    catch (NumberFormatException ex) {
      ok = false;
    }
  }
%>

<%--結果畫面--%>
<!DOCTYPE html>
<html lang="zh-Hant">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>送出結果</title>
  <style>
    body { margin:0; font-family:"Noto Sans TC","Microsoft JhengHei",sans-serif; background:#f5f7fb; color:#0f172a; }
    .wrap { max-width:680px; margin:3rem auto; padding:0 1rem; }
    .card { background:#fff; border-radius:16px; padding:1.25rem; box-shadow:0 8px 24px rgba(15,23,42,.08); }
    h1 { margin-top:0; }
    ul { line-height:1.9; padding-left:1.1rem; }
    .ok { color:#166534; }
    .fail { color:#b91c1c; }
    .back-btn { display:inline-block; margin-top:1rem; background:#4f46e5; color:#fff; text-decoration:none; padding:.65rem 1rem; border-radius:10px; }
  </style>
</head>
<body>
  <div class="wrap">
    <div class="card">

      <%--如果資料沒問題顯示成功訊息，然後顯示使用者輸入的資料--%>
      <% if (ok) { %>
        <h1 class="ok">✅ 資料送出成功</h1>
        <ul>
          <li>類型：<%= "expense".equals(type) ? "支出" : "收入" %></li>
          <li>金額：$ <%= String.format("%,.0f", amountValue) %></li>
          <li>類別：<%= escHtml(category) %></li>
          <li>日期：<%= escHtml(date) %></li>
          <li>備註：<%= escHtml((note == null || note.trim().isEmpty()) ? "-" : note) %></li>
        </ul>
      <% } 
      <%--如果資料有問題顯示失敗訊息--%>
      else { %>
        <h1 class="fail">⚠️ 送出失敗</h1>
        <p>資料欄位不完整或格式錯誤，請返回原頁重新送出。</p>
      <% } %>
      <a class="back-btn" href="index.html">回到原本頁面查看圖表及列表</a>
    </div>
  </div>
</body>
</html>
