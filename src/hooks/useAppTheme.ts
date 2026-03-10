import { useSelector } from "react-redux";
import { RootState } from "../store";
import { LIGHT_THEME, DARK_THEME } from "../constants/theme";

export const useAppTheme = () => {
  const isDarkMode = useSelector((state: RootState) => state.ui.isDarkMode);
  const theme = isDarkMode ? DARK_THEME : LIGHT_THEME;

  return {
    theme,
    isDarkMode,
  };
};
