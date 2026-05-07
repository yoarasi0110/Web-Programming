<%@ page contentType="text/html; charset=UTF-8" pageEncoding="UTF-8" %>
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
<%
  request.setCharacterEncoding("UTF-8");
  String type = request.getParameter("type");
  String amount = request.getParameter("amount");
  String category = request.getParameter("category");
  String date = request.getParameter("date");
  String note = request.getParameter("note");

  boolean ok = type != null && amount != null && category != null && date != null
      && !type.trim().isEmpty() && !amount.trim().isEmpty()
      && !category.trim().isEmpty() && !date.trim().isEmpty();

  double amountValue = 0;
  if (ok) {
    try {
      amountValue = Double.parseDouble(amount);
      if (amountValue <= 0) ok = false;
    } catch (NumberFormatException ex) {
      ok = false;
    }
  }
%>
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
      <% if (ok) { %>
        <h1 class="ok">✅ 資料送出成功</h1>
        <ul>
          <li>類型：<%= "expense".equals(type) ? "支出" : "收入" %></li>
          <li>金額：$ <%= String.format("%,.0f", amountValue) %></li>
          <li>類別：<%= escHtml(category) %></li>
          <li>日期：<%= escHtml(date) %></li>
          <li>備註：<%= escHtml((note == null || note.trim().isEmpty()) ? "-" : note) %></li>
        </ul>
      <% } else { %>
        <h1 class="fail">⚠️ 送出失敗</h1>
        <p>資料欄位不完整或格式錯誤，請返回原頁重新送出。</p>
      <% } %>
      <a class="back-btn" href="index.html">回到原本頁面查看圖表及列表</a>
    </div>
  </div>
</body>
</html>