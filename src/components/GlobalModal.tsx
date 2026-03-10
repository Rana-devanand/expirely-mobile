import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Modal, Portal, Button } from "react-native-paper";
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

  const getIcon = () => {
    switch (type) {
      case "danger":
        return <AlertTriangle color="#EF4444" size={32} />;
      case "success":
        return <CheckCircle2 color="#10B981" size={32} />;
      default:
        return <Info color={theme.colors.primary} size={32} />;
    }
  };

  return (
    <Portal>
      <Modal
        visible={isVisible}
        onDismiss={handleCancel}
        contentContainerStyle={[
          styles.modalContainer,
          { backgroundColor: theme.colors.card },
        ]}
      >
        <View style={styles.content}>
          <View style={styles.iconContainer}>{getIcon()}</View>
          <Text style={[styles.title, { color: theme.colors.text }]}>
            {title}
          </Text>
          <Text style={[styles.message, { color: theme.colors.textSecondary }]}>
            {message}
          </Text>

          <View style={styles.actions}>
            <TouchableOpacity
              style={[
                styles.button,
                styles.cancelButton,
                {
                  backgroundColor: isDarkMode
                    ? "rgba(255,255,255,0.05)"
                    : "#F1F5F9",
                },
              ]}
              onPress={handleCancel}
            >
              <Text style={[styles.buttonText, { color: theme.colors.text }]}>
                {cancelText}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.button,
                styles.confirmButton,
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
    margin: 20,
    borderRadius: 24,
    padding: 24,
    elevation: 5,
  },
  content: {
    alignItems: "center",
  },
  iconContainer: {
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 8,
    textAlign: "center",
  },
  message: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 24,
    lineHeight: 22,
  },
  actions: {
    flexDirection: "row",
    gap: 12,
    width: "100%",
  },
  button: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  cancelButton: {},
  confirmButton: {},
  buttonText: {
    fontSize: 16,
    fontWeight: "600",
  },
  confirmText: {
    color: "#FFFFFF",
  },
});
