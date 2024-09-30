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
    if (!newEventName.trim() && !selectedOption) {
      Alert.alert('Error', 'โปรดใส่ข้อความหรือเลือกหัวข้อ');
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
      const selectedDateObj = new Date(selectedDate); // Convert selectedDate to Date object
      const timeDiff = nextPeriodDate - selectedDateObj; // Subtract Date objects
      return Math.ceil(timeDiff / (1000 * 60 * 60 * 24)); // Convert milliseconds to days
    }
    return null;
  };
  

  const renderItem = (reservation, isFirst) => {
    const fontSize = isFirst ? 16 : 14;
    const color = isFirst ? 'black' : '#43515c';

    return (
      <TouchableOpacity
        style={[styles.item, { height: reservation.height }]}
        onPress={() => Alert.alert(reservation.name, `${reservation.option}`)}
      >
        <Text style={{ fontSize, color }}>{reservation.name}</Text>
        <Text style={styles.optionText}>{`${reservation.option}`}</Text>
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
        theme={{
          backgroundColor: '#FFFFFF', // White background for the calendar
          calendarBackground: '#FFFFFF', // White background for the calendar
          textSectionTitleColor: '#333333', // Dark grey for section title
          selectedDayBackgroundColor: '#FF69B4', // Pink for selected day
          selectedDayTextColor: '#FFFFFF', // White text for selected day
          todayTextColor: '#FF69B4', // Pink for today's date
          dayTextColor: '#333333', // Dark grey for regular days
          textDisabledColor: '#d9e1e8', // Light grey for disabled days
          dotColor: '#FF69B4', // Pink dots for events
          selectedDotColor: '#FFFFFF', // White dot for selected day
          arrowColor: '#FF69B4', // Pink for arrows
          monthTextColor: '#333333', // Dark grey for month text
          indicatorColor: '#FF69B4', // Pink for indicator
          textDayFontWeight: '300',
          textMonthFontWeight: 'bold',
          textDayHeaderFontWeight: '300',
          textDayFontSize: 16,
          textMonthFontSize: 16,
          textDayHeaderFontSize: 16,
        }}
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
            <TouchableOpacity style={styles.modalButton} onPress={addEvent}>
              <Text style={styles.modalButtonText}>เพิ่มเหตุการณ์</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.modalButton, styles.cancelButton]} onPress={() => setModalVisible(false)}>
              <Text style={styles.modalButtonText}>ยกเลิก</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF', // White background for the entire screen
  },
  item: {
    backgroundColor: '#F9F9F9', // Light grey background for calendar items
    flex: 1,
    borderRadius: 15,
    padding: 15,
    marginRight: 10,
    marginTop: 17,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  optionText: {
    fontSize: 12,
    color: '#333333', // Dark grey text for options
  },
  emptyContainer: {
    flex: 1,
    marginTop: 30,
    alignItems: 'center',
    height: 100,
  },
  emptyText: {
    color: '#333333', // Dark grey text
    fontSize: 20,
    fontWeight: 'bold',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.3)', // Semi-transparent black for modal background
  },
  modalContent: {
    width: '90%',
    backgroundColor: '#FFFFFF', // White modal background
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
    color: '#333333', // Dark grey modal title text
  },
  modalInput: {
    borderWidth: 1,
    borderColor: '#E0E0E0', // Light grey border for input field
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
    fontSize: 16,
    backgroundColor: '#F9F9F9', // Light grey background for input
  },
  optionTitle: {
    fontSize: 18,
    marginBottom: 10,
    fontWeight: '600',
    color: '#333333', // Dark grey option title text
  },
  optionButton: {
    padding: 15,
    backgroundColor: '#F0F0F0', // Light grey background for option buttons
    borderRadius: 10,
    marginBottom: 10,
    alignItems: 'center',
  },
  selectedOption: {
    backgroundColor: '#D1E9F6', // Light blue background for selected options
  },
  optionButtonText: {
    color: '#333333', // Dark grey text for option buttons
    fontSize: 16,
  },
  addEventButton: {
    backgroundColor: '#FF69B4', // Pink color for the button
    borderRadius: 25,
    paddingVertical: 15,
    paddingHorizontal: 25,
    alignSelf: 'center',
    margin: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  addEventButtonText: {
    color: '#FFFFFF', // White text for add event button
    fontSize: 20,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  modalButton: {
    backgroundColor: '#FF69B4', // Pink color for modal buttons
    borderRadius: 10,
    padding: 15,
    alignItems: 'center',
    marginTop: 10,
  },
  cancelButton: {
    backgroundColor: '#FFB6C1', // Light pink for cancel button
  },
  modalButtonText: {
    color: '#FFFFFF', // White text for modal buttons
    fontSize: 18,
    fontWeight: 'bold',
  },
});


export default AgendaScreen;