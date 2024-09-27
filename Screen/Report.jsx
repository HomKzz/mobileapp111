import React from 'react';
import { SafeAreaView, Text, StyleSheet, View } from 'react-native';
import { useState } from 'react';

export default function Report() {
  const [menstruation, setMenstruation] = useState("28 วัน");
  const [variation, setVariation] = useState('2 วัน');

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.innerContainer}>
        <Text style={styles.title}>สรุปผล</Text>

        <View style={styles.statsContainer}>
          <Text style={styles.header}>สถิติรอบเดือน</Text>
          <Text style={styles.subheader}>ค่าเฉลี่ยขึ้นอยู่กับ 6 รอบเดือนล่าสุดของคุณ</Text>
          
          <View style={styles.containerD}>
            <View style={styles.row}>
              <Text style={styles.text}>ความห่างรอบเดือน</Text>
              <Text style={styles.menstruationText}>{menstruation}</Text>
            </View>
          </View>
          
          <View style={styles.containerD}>
            <View style={styles.row}>
              <Text style={styles.text}>การผันแปรการห่างรอบเดือน</Text>
              <Text style={styles.menstruationText}>{variation}</Text>
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
    backgroundColor: '#fff', // สีพื้นหลังหลักเป็นสีขาว
    textAlign:'center'
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
    backgroundColor: '#fff', // สีพื้นหลังของแต่ละบล็อก
    width: 340,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  text: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#656565',
  },
  menstruationText: {
    color: '#5856D6',
    fontWeight: 'bold',
    fontSize: 20,
  },
});
