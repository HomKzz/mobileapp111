import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView, Modal } from 'react-native';
import { CalendarList } from 'react-native-calendars';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Picker } from '@react-native-picker/picker';
import { db, auth } from '../FirebaseConfig'; // Import your Firestore and Auth instances
import { getDoc, doc, setDoc, updateDoc } from 'firebase/firestore'; // Firestore methods

export default function Home() {
  const [lastPeriod, setLastPeriod] = useState(null);
  const [cycleLength, setCycleLength] = useState('28');
  const [ovulationDates, setOvulationDates] = useState({});
  const [nextPeriodDates, setNextPeriodDates] = useState({});
  const [selectedDate, setSelectedDate] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [daysUntilNextPeriod, setDaysUntilNextPeriod] = useState(null);
  const [daysUntilOvulation, setDaysUntilOvulation] = useState(null);

 

  useEffect(() => {
    const loadData = async () => {
      try {
        await AsyncStorage.removeItem('lastPeriod');
        await AsyncStorage.removeItem('cycleLength');
        const user = auth.currentUser; // Get the current authenticated user
        if (user) {
          const docRef = doc(db, 'users', user.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            const userData = docSnap.data();
            setLastPeriod(userData.lastPeriod || null);
            setCycleLength(userData.cycleLength || '28');
            calculateNextPeriodAndOvulation(userData.lastPeriod, parseInt(userData.cycleLength) || 28);
          } else {
            const storedLastPeriod = await AsyncStorage.getItem('lastPeriod');
            const storedCycleLength = await AsyncStorage.getItem('cycleLength');
            if (storedLastPeriod) {
              setLastPeriod(storedLastPeriod);
              calculateNextPeriodAndOvulation(storedLastPeriod, parseInt(storedCycleLength) || 28);
            }
            if (storedCycleLength) {
              setCycleLength(storedCycleLength);
            }
          }
        }
      } catch (error) {
        console.error("Error loading data: ", error);
      }
    };

    loadData();
  }, []);

  const handlePeriodSubmit = async () => {
    try {
      const user = auth.currentUser;
      if (user && selectedDate && cycleLength) {
        await setDoc(doc(db, 'users', user.uid), {
          lastPeriod: selectedDate,
          cycleLength: cycleLength,
        });
  
        await AsyncStorage.setItem('lastPeriod', selectedDate);
        await AsyncStorage.setItem('cycleLength', cycleLength);
  
        setLastPeriod(selectedDate);
        calculateNextPeriodAndOvulation(selectedDate, parseInt(cycleLength));
        calculateDaysUntilNextPeriodAndOvulation(selectedDate, parseInt(cycleLength)); // Add this line
        setSelectedDate(null);
      }
    } catch (error) {
      console.error("Error saving period data: ", error);
    }
  };
  

  const calculateNextPeriodAndOvulation = (startDate, cycle) => {
    const nextPeriods = {};
    const nextOvulations = {};
    const nextFertileDates = {};

    for (let i = 0; i < 6; i++) {
      const nextPeriodStart = new Date(startDate);
      nextPeriodStart.setDate(nextPeriodStart.getDate() + cycle * (i + 1));

      const nextPeriodEnd = new Date(nextPeriodStart);
      nextPeriodEnd.setDate(nextPeriodEnd.getDate() + 4);

      const ovulationDate = new Date(nextPeriodStart); 
      ovulationDate.setDate(ovulationDate.getDate() - 14);

      const fertileStart = new Date(ovulationDate);
      fertileStart.setDate(fertileStart.getDate() - 3);

      const fertileEnd = new Date(ovulationDate);
      fertileEnd.setDate(fertileEnd.getDate() + 1);

      for (let d = new Date(nextPeriodStart); d <= nextPeriodEnd; d.setDate(d.getDate() + 1)) {
        const formattedDate = d.toISOString().split('T')[0];
        nextPeriods[formattedDate] = {
          customStyles: {
            container: { backgroundColor: '#ff6f61', borderRadius: 10 },
            text: { color: 'white' },
          },
        };
      }

      for (let d = new Date(fertileStart); d < ovulationDate; d.setDate(d.getDate() + 1)) {
        const formattedDate = d.toISOString().split('T')[0];
        nextFertileDates[formattedDate] = {
          customStyles: {
            container: { backgroundColor: '#FFD700', borderRadius: 10 },
            text: { color: 'black' },
          },
        };
      }

      const nextDayAfterOvulation = new Date(ovulationDate);
      nextDayAfterOvulation.setDate(nextDayAfterOvulation.getDate() + 1);

      for (let d = new Date(nextDayAfterOvulation); d <= fertileEnd; d.setDate(d.getDate() + 1)) {
        const formattedDate = d.toISOString().split('T')[0];
        nextFertileDates[formattedDate] = {
          customStyles: {
            container: { backgroundColor: '#FFD700', borderRadius: 10 },
            text: { color: 'black' },
          },
        };
      }

      const formattedOvulationDate = ovulationDate.toISOString().split('T')[0];
      nextOvulations[formattedOvulationDate] = {
        customStyles: {
          container: { backgroundColor: '#FFA500', borderRadius: 10 },
          text: { color: 'white' },
        },
      };
    }

    setNextPeriodDates(nextPeriods);
    setOvulationDates({ ...nextOvulations, ...nextFertileDates });
    saveMarkedDates({ ...nextPeriods });
  };

  const calculateDaysUntilNextPeriodAndOvulation = (lastPeriod, cycleLength) => {
    if (!lastPeriod) return;
  
    const lastPeriodDate = new Date(lastPeriod);
    const nextPeriodDate = new Date(lastPeriodDate);
    nextPeriodDate.setDate(nextPeriodDate.getDate() + cycleLength);
  
    const ovulationDate = new Date(nextPeriodDate);
    ovulationDate.setDate(ovulationDate.getDate() - 14);
  
    const today = new Date();
    const daysToNextPeriod = Math.ceil((nextPeriodDate - today) / (1000 * 60 * 60 * 24));
    const daysToOvulation = Math.ceil((ovulationDate - today) / (1000 * 60 * 60 * 24));
  
    setDaysUntilNextPeriod(daysToNextPeriod);
    setDaysUntilOvulation(daysToOvulation);
  
    saveDaysToFirestore(daysToNextPeriod, daysToOvulation);
  };
  
  const saveDaysToFirestore = async (daysToNextPeriod, daysToOvulation) => {
    try {
      const userId = auth.currentUser.uid;
      const docRef = doc(db, 'users', userId);
      await setDoc(docRef, {
        daysUntilNextPeriod: daysToNextPeriod,
        daysUntilOvulation: daysToOvulation,
      }, { merge: true });
      console.log('Days until next period and ovulation saved to Firestore successfully!');
    } catch (error) {
      console.error('Error saving days to Firestore: ', error);
    }
  };
  
  const saveMarkedDates = async (markedDates) => {
    const datesToSave = Object.keys(markedDates);

    await AsyncStorage.setItem('markedDates', JSON.stringify(datesToSave));

    try {
      const userId = auth.currentUser.uid;
      const docRef = doc(db, 'users', userId);
      await setDoc(docRef, { markedDates: datesToSave }, { merge: true });
      console.log('Marked dates saved to Firestore successfully!');
    } catch (error) {
      console.error('Error saving marked dates to Firestore: ', error);
    }
  };

  const handleReset = async () => {
    try {
      const user = auth.currentUser;
      if (user) {
        await updateDoc(doc(db, 'users', user.uid), {
          lastPeriod: null,
          cycleLength: null,
        });
      }

      await AsyncStorage.removeItem('lastPeriod');
      await AsyncStorage.removeItem('cycleLength');
      setLastPeriod(null);
      setCycleLength('28');
      setOvulationDates({});
      setNextPeriodDates({});
      setSelectedDate(null);
    } catch (error) {
      console.error("Error resetting data: ", error);
    }
  };

  const handleDayPress = (day) => {
    setSelectedDate(day.dateString);
    setModalVisible(true);
  };

  const markedDates = {
    ...(lastPeriod && {
      [lastPeriod]: {
        customStyles: {
          container: { backgroundColor: '#6A9AB0', borderRadius: 10 },
          text: { color: 'black' },
        },
      },
    }),
    ...ovulationDates,
    ...nextPeriodDates,
    ...(selectedDate && {
      [selectedDate]: {
        customStyles: {
          container: { backgroundColor: 'red', borderRadius: 10 },
          text: { color: 'black' },
        },
      },
    }),
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.titleapp}>ปฏิทินคำนวณประจำเดือน</Text>

      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <CalendarList
          onDayPress={handleDayPress}
          markedDates={markedDates}
          markingType={'custom'}
          theme={{
            todayTextColor: 'red',
          }}
        />
      </ScrollView>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.title}>รอบประจำเดือน</Text>

            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={cycleLength}
                style={styles.picker}
                onValueChange={(itemValue) => setCycleLength(itemValue)}
                mode="dialog"
                itemStyle={{ height: 120, fontSize: 20 }}
              >
                {[...Array(11)].map((_, index) => {
                  const value = 21 + index;
                  return <Picker.Item key={value} label={`${value}`} value={`${value}`} />;
                })}
              </Picker>
            </View>

            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={styles.button}
                onPress={() => {
                  handlePeriodSubmit();
                  setModalVisible(false);
                }}
              >
                <Text style={styles.buttonText}>ยืนยัน</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.resetButton} onPress={handleReset}>
                <Text style={styles.buttonText}>รีเซ็ต</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.closeButton} onPress={() => setModalVisible(false)}>
                <Text style={styles.buttonText}>ปิด</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <View style={styles.legendContainer}>
        <View style={styles.legendItem}>
          <View style={[styles.legendColor, { backgroundColor: '#ff6f61' }]} />
          <Text style={styles.legendText}>ประจำเดือน</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendColor, { backgroundColor: '#FFD700' }]} />
          <Text style={styles.legendText}>วันไข่สุก</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendColor, { backgroundColor: '#FFA500' }]} />
          <Text style={styles.legendText}>วันไข่ตก</Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 20,
    paddingHorizontal: 10,
    backgroundColor: '#f8f8f8',
  },
  titleapp: {
    fontSize: 30,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
    color: '#333',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
    color: '#333',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    width: '90%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 2,
    elevation: 5,
  },
  pickerContainer: {
    marginVertical: 10,
  },
  picker: {
    height: 50,
    width: 150,
    alignSelf: 'center',
  },
  buttonContainer: {
    marginTop: 20,
  },
  button: {
    backgroundColor: '#4CAF50',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    marginVertical: 5,
    marginTop: 50
  },
  resetButton: {
    backgroundColor: '#f44336',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    marginVertical: 5,
  },
  closeButton: {
    backgroundColor: '#333',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    marginVertical: 5,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  legendContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginVertical: 20,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 10,
  },
  legendColor: {
    width: 15,
    height: 15,
    borderRadius: 7.5,
    marginRight: 5,
  },
  legendText: {
    fontSize: 16,
    color: '#333',
  },
});

