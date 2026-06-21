import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Modal, Portal } from "react-native-paper";
import { useGlobalModal } from "../hooks/useGlobalModal";
import { useAppTheme } from "../hooks/useAppTheme";
import { AlertTriangle, Info, CheckCircle2 } from "lucide-react-native";

export default function GlobalModal() {
  const { modalState, hideModal } = useGlobalModal();
  const { isVisible, options } = modalState;
  const { theme, isDarkMode } = useAppTheme();

  if (!options) return null;

  const {
    title,
    message,
    confirmText = "Confirm",
    cancelText = "Cancel",
    hideCancel = false,
    onConfirm,
    onCancel,
    type = "info",
  } = options;

  const handleConfirm = () => {
    onConfirm();
    hideModal();
  };

  const handleCancel = () => {
    if (onCancel) onCancel();
    hideModal();
  };

  const getIconColor = () => {
    switch (type) {
      case "danger":
        return "#EF4444";
      case "success":
        return "#10B981";
      default:
        return theme.colors.primary;
    }
  };

  const getIcon = () => {
    const color = getIconColor();
    switch (type) {
      case "danger":
        return <AlertTriangle color={color} size={28} />;
      case "success":
        return <CheckCircle2 color={color} size={28} />;
      default:
        return <Info color={color} size={28} />;
    }
  };

  const getIconBg = () => {
    if (type === "danger") {
      return isDarkMode ? "rgba(239, 68, 68, 0.14)" : "#FEF2F2";
    }
    if (type === "success") {
      return isDarkMode ? "rgba(16, 185, 129, 0.14)" : "#ECFDF5";
    }
    return isDarkMode ? "rgba(69, 209, 160, 0.14)" : "#EFF7F2";
  };

  return (
    <Portal>
      <Modal
        visible={isVisible}
        onDismiss={handleCancel}
        contentContainerStyle={[
          styles.modalContainer,
          {
            backgroundColor: theme.colors.card,
            borderWidth: isDarkMode ? 1 : 0,
            borderColor: theme.colors.border,
          },
        ]}
      >
        <View style={styles.content}>
          <View style={[styles.iconContainer, { backgroundColor: getIconBg() }]}>
            {getIcon()}
          </View>
          <Text style={[styles.title, { color: theme.colors.text }]}>
            {title}
          </Text>
          <Text style={[styles.message, { color: theme.colors.textSecondary }]}>
            {message}
          </Text>

          <View style={styles.actions}>
            {!hideCancel && (
              <TouchableOpacity
                style={[
                  styles.button,
                  styles.cancelButton,
                  {
                    backgroundColor: isDarkMode ? "rgba(255,255,255,0.03)" : "#F1F5F9",
                    borderColor: theme.colors.border,
                  },
                ]}
                onPress={handleCancel}
              >
                <Text style={[styles.buttonText, { color: theme.colors.textSecondary }]}>
                  {cancelText}
                </Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={[
                styles.button,
                styles.confirmButton,
                hideCancel && styles.singleButton,
                {
                  backgroundColor:
                    type === "danger" ? "#EF4444" : theme.colors.primary,
                },
              ]}
              onPress={handleConfirm}
            >
              <Text style={[styles.buttonText, styles.confirmText]}>
                {confirmText}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </Portal>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    margin: 24,
    borderRadius: 28,
    padding: 24,
    elevation: 8,
    alignSelf: "center",
    width: "90%",
    maxWidth: 340,
  },
  content: {
    alignItems: "center",
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  title: {
    fontSize: 19,
    fontWeight: "800",
    marginBottom: 8,
    textAlign: "center",
    letterSpacing: -0.2,
  },
  message: {
    fontSize: 14,
    textAlign: "center",
    marginBottom: 24,
    lineHeight: 20,
    fontWeight: "600",
  },
  actions: {
    flexDirection: "row",
    gap: 12,
    width: "100%",
  },
  button: {
    flex: 1,
    height: 48,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "transparent",
  },
  cancelButton: {},
  confirmButton: {},
  singleButton: {
    flex: 0,
    width: "100%",
  },
  buttonText: {
    fontSize: 14,
    fontWeight: "800",
  },
  confirmText: {
    color: "#FFFFFF",
  },
});
