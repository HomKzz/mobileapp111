import React, { useEffect, useState } from 'react';
import { SafeAreaView, Text, StyleSheet, View } from 'react-native';
import { db, auth } from '../FirebaseConfig'; // Import your Firestore and Auth instances
import { doc, onSnapshot } from 'firebase/firestore'; // Firestore methods
import Fontisto from '@expo/vector-icons/Fontisto';
import FontAwesome6 from 'react-native-vector-icons/FontAwesome6'; 

export default function Report() {
  const [menstruation, setMenstruation] = useState("28 วัน");
  const [variation, setVariation] = useState('2 วัน');
  const [daysUntilNextPeriod, setDaysUntilNextPeriod] = useState(0);
  const [daysUntilOvulation, setDaysUntilOvulation] = useState(0);

  useEffect(() => {
    const fetchCycleData = () => {
      const user = auth.currentUser;
      if (user) {
        const docRef = doc(db, 'users', user.uid);
        const unsubscribe = onSnapshot(docRef, (docSnap) => {
          if (docSnap.exists()) {
            const userData = docSnap.data();
            const lastPeriod = new Date(userData.lastPeriod);
            const cycleLength = parseInt(userData.cycleLength) || 28;
            const today = new Date();

            // Calculate days until next period
            const nextPeriodDate = new Date(lastPeriod);
            nextPeriodDate.setDate(lastPeriod.getDate() + cycleLength);
            const daysUntilNext = Math.ceil((nextPeriodDate - today) / (1000 * 60 * 60 * 24));
            setDaysUntilNextPeriod(daysUntilNext >= 0 ? daysUntilNext : 0);

            // Calculate days until ovulation
            const ovulationDate = new Date(nextPeriodDate);
            ovulationDate.setDate(ovulationDate.getDate() - 14);
            const daysUntilOvulation = Math.ceil((ovulationDate - today) / (1000 * 60 * 60 * 24));
            setDaysUntilOvulation(daysUntilOvulation >= 0 ? daysUntilOvulation : 0);
          }
        });

        // Clean up the listener when the component unmounts
        return () => unsubscribe();
      }
    };

    fetchCycleData();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.innerContainer}>
        <Text style={styles.title}>สรุปผล</Text>

        <View style={styles.statsContainer}>
          <Text style={styles.header}>รอบเดือน</Text>

          <View style={styles.containerD}>
            <View style={styles.row}>
              <Text style={styles.text}>
                <FontAwesome6 name="egg" size={24} color="#FDDBB0" /> วันไข่ตกอีกกี่วัน
              </Text>
              <Text style={styles.menstruationText}>{daysUntilOvulation-1} วัน</Text>
            </View>
            <Text style={styles.note}>
              หมายเหตุ: วันไข่ตกมีโอกาสมีโอรสสูง
            </Text>
          </View>

          <View style={styles.containerD}>
            <View style={styles.row}>
              <Text style={styles.text}>
                <Fontisto name="blood-drop" size={24} color="red" /> ประจำเดือนจะมาอีกกี่วัน
              </Text>
              <Text style={styles.menstruationText}>{daysUntilNextPeriod-1} วัน</Text>
            </View>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    textAlign: 'center'
  },
  innerContainer: {
    padding: 16,
    paddingTop: 30,
    width: '100%',
    alignItems: 'center'
  },
  title: {
    fontSize: 40,
    color: '#5856D6',
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  statsContainer: {
    margin: 20,
  },
  header: {
    fontSize: 30,
    fontWeight: '600',
    marginBottom: 10,
  },
  subheader: {
    marginBottom: 10,
    fontSize: 16,
    fontWeight: 'bold',
    color: '#656565',
  },
  containerD: {
    borderColor: '#CEE3EF',
    borderWidth: 5,
    padding: 20,
    marginTop: 10,
    marginBottom: 10,
    borderRadius: 15,
    backgroundColor: '#fff',
    width: 340,
    height: 220, // Increased height to accommodate note
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flex: 1,
  },
  text: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#656565',
    textAlign: 'center', // Center text
  },
  menstruationText: {
    color: '#5856D6',
    fontWeight: 'bold',
    fontSize: 20,
    textAlign: 'center', // Center text
  },
  note: {
    marginTop: 10,
    fontSize: 14,
    color: '#FF6347', // Note color
    textAlign: 'center', // Center note text
  },
});
