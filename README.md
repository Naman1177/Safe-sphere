# SafeSphere: Intelligent LoRa-Enabled Smart Safety Helmet

## 📖 How It Works

SafeSphere operates on a continuous, real-time edge-to-cloud feedback loop divided into three main phases:

* **Edge Sensing & Processing:** The microcontroller embedded in the safety helmet constantly polls the onboard sensor array. Instead of streaming raw, noisy data, the microcontroller runs local edge algorithms to filter background noise and detect immediate threats.
* **Long-Range Transmission:** When an environmental threshold is crossed or an impact signature is detected, the microcontroller packages the telemetry into an optimized binary payload. It transmits this data over sub-GHz radio frequencies using the LoRa protocol, bypassing the need for cellular towers or local Wi-Fi.
* **Gateway Routing & Visualization:** A central localized gateway receives the radio packets, unpacks the binary payloads into structured data, and forwards them to a centralized emergency monitoring dashboard. This dashboard updates in real time to provide safety operators with active situational awareness.

---

## 🎯 What It Solves

* **Communication Blackouts in High-Risk Zones:** Standard wireless infrastructure (Wi-Fi, cellular) frequently fails in underground mines, remote construction zones, and heavily shielded industrial environments. SafeSphere establishes its own off-grid, long-range communication network.
* **Delayed Emergency Response Times:** In the event of an accident or fall, a worker might be knocked unconscious or left unable to call for help. The system completely automates distress signals, ensuring safety supervisors are instantly alerted without human intervention.
* **Unseen Environmental Hazards:** Toxic gases, sudden oxygen depletion, and extreme thermal conditions can incapacitate workers before they notice the danger. Continuous atmospheric monitoring acts as an early warning system to prevent acute exposure and heat exhaustion.
* **Lack of Centralized Worker Safety Telemetry:** Safety officers traditionally rely on manual check-ins. This project creates a centralized visual interface tracking the live structural safety flags, environmental safety scores, and battery capacities of an entire active workforce simultaneously.

---

## 🎛️ Sensor & Communication Protocol Matrix

| System Component | Core Function | Hardware Protocol / Interface | Wireless Network Protocol |
| :--- | :--- | :--- | :--- |
| **Microcontroller Core** | Central processing & data aggregation | SPI, I2C, UART, GPIO | N/A (Edge Host) |
| **Inertial Measurement Unit (IMU)** | Fall detection, impact tracking, & tri-axial acceleration | I2C or SPI | N/A (On-device telemetry) |
| **Gas Detection Sensor Array** | Monitoring toxic and combustible gas concentrations | Analog (ADC via GPIO) or I2C | N/A (On-device telemetry) |
| **Temperature & Humidity Sensor** | Ambient environmental monitoring & thermal protection | I2C or Single-Wire Digital | N/A (On-device telemetry) |
| **LoRa Transceiver Module** | Edge-to-gateway wireless packet transmission | SPI (Microcontroller side) | LoRa (Sub-GHz ISM Band) |
| **Central Gateway** | Packet serialization, parsing, & backend routing | UART / SPI (Receiver side) | MQTT / WebSockets (Gateway to Dashboard) |
