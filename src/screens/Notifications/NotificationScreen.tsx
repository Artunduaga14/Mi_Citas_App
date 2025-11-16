import React, { useState, useEffect } from "react";
import { FlatList, View,Text,TouchableOpacity ,StyleSheet } from "react-native";
import { notificationSocket } from "../../services/socket/notification.socket";
import { NotificationItem } from "../../models/NotificationItem";
import { useNavigation } from "@react-navigation/native";
import { MaterialIcons } from "@expo/vector-icons";
import { HttpService } from "../../services/GenericServices";
export default function NotificationsScreen() {
 const [list, setList] = useState<NotificationItem[]>([]);
  const navigation = useNavigation<any>();

  useEffect(() => {
    const sub = notificationSocket.notifications$.subscribe((items) => {
      setList(items);
    });

    GetAllUSer();

    return () => sub.unsubscribe();
  }, []);

const GetAllUSer = async () => {
    const response = await HttpService.GetAllUsers("Notification");
    console.log("Usuarios:", response.data);
  }
  return (
    <View style={{ flex: 1 }}>
      {/* 🔙 Botón de volver */}
      <View style={styles.headerContainer}>
        <TouchableOpacity  style={styles.backButton} onPress={() => navigation.goBack()}>
          <MaterialIcons name="arrow-back" size={28} color="#333" />
        </TouchableOpacity>
      </View>

      {/* 📄 Lista de notificaciones */}
      <FlatList
        data={list}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View
            style={{
              padding: 15,
              borderBottomWidth: 1,
              borderColor: "#ddd",
            }}
          >
            <Text style={{ fontWeight: "600" }}>{item.title}</Text>
            <Text>{item.message}</Text>
            <Text
              style={{
                fontSize: 12,
                marginTop: 5,
                color: "#666",
              }}
            >
              {item.date}
            </Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({

backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F5F7FA',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  headerContainer: {
    backgroundColor: '#fff',
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 4,
  },
});