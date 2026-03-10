import React, { useRef, useState } from "react";
import { View, Text, TouchableOpacity, Image } from "react-native";
import PagerView from "react-native-pager-view";
import { useDispatch } from "react-redux";
import { completeOnboarding } from "../../store/uiSlice";
import { useAppTheme } from "../../hooks/useAppTheme";
import { storage } from "../../services/storage";
import { getStyles } from "./styles";
import { ArrowRight } from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";

const ONBOARDING_DATA = [
  {
    title: "Scan Products Instantly",
    description:
      "Use barcode scanning to add items quickly and accurately to your smart inventory.",
    image: require("../../../assets/onBoarding/person-scanning.jpg"),
    colors: ["#F97316", "#FB923C"], // Orange
    swashColor: "#FB923C",
  },
  {
    title: "Organize Your Inventory",
    description:
      "Keep all your groceries and household items in one beautifully organized place.",
    image: require("../../../assets/onBoarding/inventory.png"),
    colors: ["#7C3AED", "#8B5CF6"], // Purple
    swashColor: "#8B5CF6",
  },
  {
    title: "Stay Ahead of Expiry Dates",
    description:
      "Receive timely alerts before products expire so you never waste food again.",
    image: require("../../../assets/onBoarding/alerts.png"),
    colors: ["#0D9488", "#14B8A6"], // Teal
    swashColor: "#14B8A6",
  },
  {
    title: "Track Your Usage",
    description:
      "See smart analytics and insights about your consumption and savings.",
    image: require("../../../assets/onBoarding/analytics.png"),
    colors: ["#0F172A", "#334155"], // Dark/Navy
    swashColor: "#00F5D4",
  },
];

export default function OnboardingScreen() {
  const { theme, isDarkMode } = useAppTheme();
  const styles = getStyles(theme, isDarkMode);
  const dispatch = useDispatch();
  const pagerRef = useRef<PagerView>(null);
  const [activePage, setActivePage] = useState(0);

  const handleNext = async () => {
    if (activePage < ONBOARDING_DATA.length - 1) {
      pagerRef.current?.setPage(activePage + 1);
    } else {
      await storage.saveOnboardingComplete(true);
      dispatch(completeOnboarding());
    }
  };

  return (
    <View style={styles.container}>
      <PagerView
        ref={pagerRef}
        style={{ flex: 1 }}
        initialPage={0}
        onPageSelected={(e) => setActivePage(e.nativeEvent.position)}
      >
        {ONBOARDING_DATA.map((item, index) => (
          <View key={index} style={styles.page}>
            <LinearGradient
              colors={item.colors as [string, string]}
              style={[
                styles.container,
                { width: "100%", height: "100%", position: "absolute" },
              ]}
            />

            <View style={styles.illustrationContainer}>
              <Image
                source={item.image}
                style={styles.illustration}
                resizeMode="cover"
              />
            </View>

            <LinearGradient
              colors={["transparent", "rgba(0,0,0,0.8)"]}
              style={styles.bottomFade}
            />

            <View style={styles.textContainer}>
              <Text style={styles.title}>{item.title}</Text>
              <Text style={styles.description}>{item.description}</Text>
            </View>
          </View>
        ))}
      </PagerView>

      <View style={styles.footer}>
        <View style={styles.dotContainer}>
          {ONBOARDING_DATA.map((_, index) => (
            <View
              key={index}
              style={[styles.dot, activePage === index && styles.activeDot]}
            />
          ))}
        </View>

        <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
          <Text style={styles.nextText}>
            {activePage === ONBOARDING_DATA.length - 1 ? "GET STARTED" : "NEXT"}
          </Text>
          <ArrowRight color="#FFFFFF" size={24} />
        </TouchableOpacity>
      </View>
    </View>
  );
}
