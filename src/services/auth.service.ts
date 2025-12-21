export const authService = {
  login: async (email: string, pass: string) => {
    await new Promise((resolve) => setTimeout(resolve, 800));

    //Admin mặc định theo yêu cầu
    if (email === "namhai@gmail.com" && pass === "123456") {
      const user = { id: "1", name: "Ban Quản Lý", role: "admin" };
      localStorage.setItem("user", JSON.stringify(user));
      localStorage.setItem("token", "fake-token-clover");
      return user;
    }
    throw new Error("Tài khoản hoặc mật khẩu không đúng!");
  },

  logout: () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    window.location.href = "/login";
  }
};