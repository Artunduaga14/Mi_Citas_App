import React, { useState, useEffect } from "react";
import { FlatList, View,Text } from "react-native";
import { notificationSocket } from "../../services/socket/notification.socket";
import { NotificationItem } from "../../models/NotificationItem";

export default function NotificationsScreen() {
 const [list, setList] = useState<NotificationItem[]>([]);


  useEffect(() => {
    const sub = notificationSocket.notifications$.subscribe((items) => {
      setList(items);
    });

    return () => sub.unsubscribe();
  }, []);

  return (
    <FlatList
      data={list}
      keyExtractor={(item) => item.id.toString()}
      renderItem={({ item }) => (
        <View style={{ padding: 15, borderBottomWidth: 1, borderColor: "#ddd" }}>
          <Text style={{ fontWeight: "600" }}>{item.title}</Text>
          <Text>{item.message}</Text>
          <Text style={{ fontSize: 12, marginTop: 5, color: "#666" }}>
            {item.date}
          </Text>
        </View>
      )}
    />
  );
}