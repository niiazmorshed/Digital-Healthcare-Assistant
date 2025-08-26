const Dark = () => {
  const setLight = () => {
    document.querySelector("body").setAttribute("data-theme", "light");
  };

  const setDark = () => {
    document.querySelector("body").setAttribute("data-theme", "dark");
  };

  const toggleFunction = (e) => {
    if (e.target.checked) setDark();
    else setLight();
  };

  return (
    <div className="flex items-center gap-2">
      <p className="text-lg font-semibold"></p>

      <input
        className="toggle toggle-md mr-2"
        onChange={toggleFunction}
        type="checkbox"
      />

      <label className="dark_mode_label"></label>
    </div>
  );
};
export default Dark;
