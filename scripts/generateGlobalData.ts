/**
 * Script to generate global.json file from CSV data sources
 * 
 * This script reads:
 * - monthly_in_situ_co2_mlo.csv (CO2 data)
 * - GLB.Ts+dSST.csv (Temperature data)
 * - AIS_COSTG_0100_0003.csv (Antarctic ice mass data from GRACE satellites)
 * 
 * And generates:
 * - public/data/global.json
 */

import * as fs from 'fs';
import * as path from 'path';
import { parseCO2CSV, parseTemperatureData, parseArcticIceData, calculateMetrics } from '../lib/parseGlobalData';

const ROOT_DIR = path.join(__dirname, '..');
const CO2_CSV_PATH = path.join(ROOT_DIR, 'monthly_in_situ_co2_mlo.csv');
const TEMP_CSV_PATH = path.join(ROOT_DIR, 'GLB.Ts+dSST.csv');
const ICE_CSV_PATH = path.join(ROOT_DIR, 'AIS_COSTG_0100_0003.csv');
const OUTPUT_PATH = path.join(ROOT_DIR, 'public', 'data', 'global.json');

async function generateGlobalData() {
  console.log('📊 Generating global climate data...\n');

  try {
    // Read CO2 data
    console.log('📈 Reading CO2 data from:', CO2_CSV_PATH);
    const co2CsvContent = fs.readFileSync(CO2_CSV_PATH, 'utf-8');
    const co2Data = parseCO2CSV(co2CsvContent);
    console.log(`✅ Parsed ${co2Data.length} CO2 data points (${co2Data[0].date} to ${co2Data[co2Data.length - 1].date})\n`);

    // Read temperature data
    console.log('🌡️  Reading temperature data from:', TEMP_CSV_PATH);
    const tempCsvContent = fs.readFileSync(TEMP_CSV_PATH, 'utf-8');
    const tempData = parseTemperatureData(tempCsvContent);
    console.log(`✅ Parsed ${tempData.length} temperature data points (${tempData[0].year} to ${tempData[tempData.length - 1].year})\n`);

    // Read Antarctic ice data from GRACE satellites
    console.log('🧊 Reading Antarctic ice mass data from:', ICE_CSV_PATH);
    const iceCsvContent = fs.readFileSync(ICE_CSV_PATH, 'utf-8');
    const iceData = parseArcticIceData(iceCsvContent);
    console.log(`✅ Parsed ${iceData.length} Antarctic ice mass data points (${iceData[0].year} to ${iceData[iceData.length - 1].year})\n`);

    // Calculate metrics and create final data structure
    console.log('🔢 Calculating metrics...');
    const globalData = calculateMetrics(co2Data, tempData, iceData, iceCsvContent);
    console.log('✅ Metrics calculated\n');

    // Write to JSON file
    console.log('💾 Writing to:', OUTPUT_PATH);
    const jsonContent = JSON.stringify(globalData, null, 2);
    fs.writeFileSync(OUTPUT_PATH, jsonContent, 'utf-8');
    console.log('✅ global.json file generated successfully!\n');

    // Print summary
    console.log('📊 Summary:');
    console.log(`   CO2: ${globalData.co2.current} (${globalData.co2.change})`);
    console.log(`   Temperature: ${globalData.temperature.current} (${globalData.temperature.change})`);
    console.log(`   Antarctic Ice: ${globalData.arcticIce.current} (${globalData.arcticIce.change})`);
    console.log(`   🎯 Ice Loss Rate: ${globalData.arcticIce.annualLossRate} (THE HERO STAT)`);
    console.log('\n✨ Done!\n');

  } catch (error) {
    console.error('❌ Error generating global data:', error);
    process.exit(1);
  }
}

// Run the script
generateGlobalData();

