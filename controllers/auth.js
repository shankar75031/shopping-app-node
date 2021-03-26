exports.getLogin = (req, res, next) => {
  const isLoggedIn =
    req.get("Cookie").split(";")[0].trim().split("=")[1] === "true";
  res.render("auth/login", {
    path: "/login",
    pageTitle: "Login",
    isAuthenticated: isLoggedIn,
  });
};

exports.postLogin = (req, res, next) => {
  // Add Expires=httpdate or Max-Age=no. of seconds to expiry
  //   Add Secure if to use cookie in https site only
  // Add Domain to set domain to which to send cookie
  //   HttpOnly for accessing the cookie value only through http and not through client side js
  res.setHeader("Set-Cookie", "loggedIn=true");
  res.redirect("/");
};
