<%@ page contentType="application/json; charset=UTF-8" pageEncoding="UTF-8" %>
<%!
  private String esc(String s) {
    if (s == null) return "";
    StringBuilder sb = new StringBuilder();
    for (int i = 0; i < s.length(); i++) {
      char c = s.charAt(i);
      switch (c) {
        case '\\': sb.append("\\\\"); break;
        case '"': sb.append("\\\""); break;
        case '\n': sb.append("\\n"); break;
        case '\r': sb.append("\\r"); break;
        case '\t': sb.append("\\t"); break;
        default: sb.append(c);
      }
    }
    return sb.toString();
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

  if (!ok) {
    response.setStatus(400);
    out.print("{\"ok\":false,\"message\":\"欄位不完整，請確認後再送出。\"}");
    return;
  }

  double amountValue;
  try {
    amountValue = Double.parseDouble(amount);
    if (amountValue <= 0) throw new NumberFormatException("must be > 0");
  } catch (NumberFormatException ex) {
    response.setStatus(400);
    out.print("{\"ok\":false,\"message\":\"金額格式錯誤。\"}");
    return;
  }

  out.print("{");
  out.print("\"ok\":true,");
  out.print("\"message\":\"資料已送達後端並完成處理\",");
  out.print("\"data\":{");
  out.print("\"type\":\"" + esc(type) + "\",");
  out.print("\"amount\":" + amountValue + ",");
  out.print("\"category\":\"" + esc(category) + "\",");
  out.print("\"date\":\"" + esc(date) + "\",");
  out.print("\"note\":\"" + esc(note) + "\"");
  out.print("}");
  out.print("}");
%>