import React, { useState, useEffect } from 'react';
import { Alert, StyleSheet, Text, View, TouchableOpacity, TextInput, Button, Modal, SafeAreaView, ScrollView } from 'react-native';
import { Agenda } from 'react-native-calendars';
import { auth, db } from '../FirebaseConfig';
import { doc, onSnapshot } from 'firebase/firestore';

const AgendaScreen = () => {
  const [items, setItems] = useState({});
  const [newEventName, setNewEventName] = useState('');
  const [selectedDate, setSelectedDate] = useState();
  const [markedDates, setMarkedDates] = useState({});
  const [nextPeriodDate, setNextPeriodDate] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedOption, setSelectedOption] = useState('');

  const fetchMarkedDates = () => {
    const user = auth.currentUser;
    if (user) {
      const docRef = doc(db, 'users', user.uid);
      const unsubscribe = onSnapshot(docRef, (docSnap) => {
        if (docSnap.exists()) {
          const userData = docSnap.data();
          const markedDatesFromFirestore = userData.markedDates || [];
          const markedDatesData = {};

          markedDatesFromFirestore.forEach(rawDate => {
            markedDatesData[rawDate] = {
              selected: true,
              backgroundColor: 'red',
              textColor: 'black',
              selectedColor: '#ff9ffe',
            };
          });

          if (markedDatesFromFirestore.length > 0) {
            const nextDate = new Date(markedDatesFromFirestore[0]);
            setNextPeriodDate(nextDate);
          }

          setMarkedDates(markedDatesData);
        } else {
          console.log('No such document!');
        }
      });

      return () => unsubscribe();
    }
  };

  useEffect(() => {
    fetchMarkedDates();
    if (!selectedDate) {
      setSelectedDate(getCurrentDate());
    }
  }, []);

  const getCurrentDate = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const addEvent = () => {
    if (!newEventName.trim()) {
      Alert.alert('Error', 'Event name cannot be empty!');
      return;
    }

    const newItems = { ...items };
    if (!newItems[selectedDate]) {
      newItems[selectedDate] = [];
    }

    newItems[selectedDate].push({
      name: newEventName,
      option: selectedOption,
      height: Math.max(50, Math.floor(Math.random() * 150)),
      day: selectedDate,
    });

    setItems(newItems);
    setNewEventName('');
    setSelectedOption('');
    setModalVisible(false);
  };

  const calculateDaysUntilNextPeriod = () => {
    if (nextPeriodDate) {
      const today = new Date();
      const timeDiff = nextPeriodDate - today;
      return Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
    }
    return null;
  };

  const renderItem = (reservation, isFirst) => {
    const fontSize = isFirst ? 16 : 14;
    const color = isFirst ? 'black' : '#43515c';

    return (
      <TouchableOpacity
        style={[styles.item, { height: reservation.height }]}
        onPress={() => Alert.alert(reservation.name, `Option: ${reservation.option}`)}
      >
        <Text style={{ fontSize, color }}>{reservation.name}</Text>
        <Text style={styles.optionText}>{`Option: ${reservation.option}`}</Text>
      </TouchableOpacity>
    );
  };

  const renderEmptyData = () => {
    const daysUntilNextPeriod = calculateDaysUntilNextPeriod();
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>
          {daysUntilNextPeriod !== null 
            ? `ประจำเดือนจะมาอีกใน ${daysUntilNextPeriod} วัน`
            : "ยังไม่มีข้อมูลวันประจำเดือน"}
        </Text>
      </View>
    );
  };

  const renderOptionButtons = () => {
    const options = [
      { label: 'ปวดท้องมาก', value: 'ปวดท้องมาก' },
      { label: 'ประจำเดือนมาน้อย', value: 'ประจำเดือนมาน้อย' },
      { label: 'ประจำเดือนมาไม่ปกติ', value: 'ประจำเดือนมาไม่ปกติ' },
      { label: 'อื่นๆ', value: 'อื่นๆ' },
    ];

    return options.map((option) => (
      <TouchableOpacity
        key={option.value}
        style={[
          styles.optionButton,
          selectedOption === option.value && styles.selectedOption,
        ]}
        onPress={() => setSelectedOption(option.value)}
      >
        <Text style={styles.optionButtonText}>{option.label}</Text>
      </TouchableOpacity>
    ));
  };

  return (
    <SafeAreaView style={styles.container}>
      <Agenda
        items={items}
        selected={selectedDate}
        renderItem={renderItem}
        renderEmptyData={renderEmptyData}
        rowHasChanged={(r1, r2) => r1.name !== r2.name}
        showClosingKnob={true}
        onDayPress={(day) => setSelectedDate(day.dateString)}
        markedDates={markedDates}
      />

      <TouchableOpacity 
        onPress={() => setModalVisible(true)} 
        style={styles.addEventButton}
      >
        <Text style={styles.addEventButtonText}>เพิ่มเหตุการณ์</Text>
      </TouchableOpacity>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>เพิ่มเหตุการณ์ใหม่</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="ชื่อเหตุการณ์"
              value={newEventName}
              onChangeText={setNewEventName}
            />
            <Text style={styles.optionTitle}>เลือกเหตุการณ์:</Text>
            <ScrollView>
              {renderOptionButtons()}
            </ScrollView>
            <Button title="เพิ่มเหตุการณ์" onPress={addEvent} color="#28a745" />
            <Button title="ยกเลิก" onPress={() => setModalVisible(false)} color="#ff6347" />
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  item: {
    backgroundColor: '#ffffff',
    flex: 1,
    borderRadius: 10,
    padding: 15,
    marginRight: 10,
    marginTop: 17,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
  },
  optionText: {
    fontSize: 12,
    color: '#888',
  },
  emptyContainer: {
    flex: 1,
    marginTop: 30,
    alignItems: 'center',
    height: 100,
  },
  emptyText: {
    color: '#888',
    fontSize: 20,
    fontWeight: 'bold'
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '80%',
    backgroundColor: '#ffffff',
    borderRadius: 10,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  modalInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    borderRadius: 5,
    marginBottom: 20,
  },
  optionTitle: {
    fontSize: 16,
    marginBottom: 10,
    fontWeight: '600',
  },
  optionButton: {
    padding: 10,
    backgroundColor: '#e0e0e0',
    borderRadius: 5,
    marginBottom: 10,
    alignItems: 'center',
  },
  selectedOption: {
    backgroundColor: '#4caf50',
  },
  optionButtonText: {
    color: 'black',
    fontSize: 16,
  },
  addEventButton: {
    backgroundColor: '#007bff', // สีน้ำเงิน
    borderRadius: 5,
    paddingVertical: 12, // เพิ่มระยะห่างแนวตั้ง
    paddingHorizontal: 20, // เพิ่มระยะห่างแนวนอน
    alignSelf: 'center', // จัดแนงให้กลาง
    margin: 20, // เพิ่มระยะห่างรอบปุ่ม
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  addEventButtonText: {
    color: '#fff',
    fontSize: 20,
    textAlign: 'center',
  },
});

export default AgendaScreen;
