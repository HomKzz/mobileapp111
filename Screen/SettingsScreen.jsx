import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Switch, ScrollView, Alert, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons'; // ไอคอนจาก expo
import { useNavigation } from '@react-navigation/native'; // นำเข้า navigation
import { auth } from '../FirebaseConfig'; // ดึง auth จาก FirebaseConfig

export default function SettingsScreen() {
  const [isNotificationEnabled, setNotificationEnabled] = React.useState(false);
  const navigation = useNavigation(); // สร้างตัวแปร navigation

  const toggleNotification = () => setNotificationEnabled(previousState => !previousState);

  const handleLogout = () => {
    Alert.alert(
      "ออกจากระบบ",
      "คุณต้องการออกจากระบบหรือไม่?",
      [
        {
          text: "ยกเลิก",
          style: "cancel"
        },
        {
          text: "ยืนยัน",
          onPress: () => {
            auth.signOut() // เรียกฟังก์ชันออกจากระบบของ Firebase
              .then(() => {
                navigation.replace('Auth'); // ส่งผู้ใช้ไปหน้า AuthScreen
              })
              .catch((error) => {
                console.error("Error signing out: ", error);
              });
          }
        }
      ]
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>การตั้งค่า</Text>

        <View style={styles.settingItem}>
          <Ionicons name="notifications-outline" size={24} color="black" />
          <Text style={styles.settingText}>การแจ้งเตือน</Text>
          <Switch
            trackColor={{ false: '#767577', true: '#81b0ff' }}
            thumbColor={isNotificationEnabled ? '#f5dd4b' : '#f4f3f4'}
            onValueChange={toggleNotification}
            value={isNotificationEnabled}
          />
        </View>

        <TouchableOpacity style={styles.settingItem}>
          <Ionicons name="lock-closed-outline" size={24} color="black" />
          <Text style={styles.settingText}>เปลี่ยนรหัสผ่าน</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.settingItem}>
          <Ionicons name="person-circle-outline" size={24} color="black" />
          <Text style={styles.settingText}>ข้อมูลส่วนตัว</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={24} color="white" />
          <Text style={styles.logoutText}>ออกจากระบบ</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f7f7f7', // สีพื้นหลังของ SafeAreaView
  },
  container: { 
    flexGrow: 1, 
    justifyContent: 'flex-start', 
    alignItems: 'flex-start', 
    padding: 20, 
    backgroundColor: '#f7f7f7' 
  },
  title: { 
    fontSize: 24, 
    fontWeight: 'bold', 
    marginBottom: 30 
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    paddingVertical: 15,
    paddingHorizontal: 10,
    backgroundColor: '#fff',
    marginBottom: 10,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  settingText: {
    fontSize: 18,
    marginLeft: 10,
    flex: 1,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ff3b30',
    width: '100%',
    paddingVertical: 15,
    borderRadius: 10,
    marginTop: 30,
  },
  logoutText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 10,
  },
});
