import Toast from "react-native-toast-message";

export const toast = {
  success: (message: string, title: string = "Success") => {
    Toast.show({
      type: "success",
      text1: title,
      text2: message,
      position: "top",
      visibilityTime: 4000,
      autoHide: true,
      topOffset: 60,
    });
  },
  error: (message: string, title: string = "Error") => {
    Toast.show({
      type: "error",
      text1: title,
      text2: message,
      position: "top",
      visibilityTime: 5000,
      autoHide: true,
      topOffset: 60,
    });
  },
  info: (message: string, title: string = "Info") => {
    Toast.show({
      type: "info",
      text1: title,
      text2: message,
      position: "top",
      visibilityTime: 4000,
      autoHide: true,
      topOffset: 60,
    });
  },
};
