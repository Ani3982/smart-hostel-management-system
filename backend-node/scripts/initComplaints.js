const pool = require('../config/db');

async function setupComplaintsTable() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS complaints (
      id BIGINT AUTO_INCREMENT PRIMARY KEY,
      student_id BIGINT NOT NULL,
      student_name VARCHAR(150),
      student_prn VARCHAR(100),
      hostel_id BIGINT NOT NULL DEFAULT 1,
      room_number VARCHAR(50) DEFAULT 'General',
      bed_number VARCHAR(50) DEFAULT '—',
      category VARCHAR(50) NOT NULL,
      title VARCHAR(200),
      description TEXT NOT NULL,
      status ENUM('PENDING', 'IN_PROGRESS', 'RESOLVED') DEFAULT 'PENDING',
      urgency ENUM('LOW', 'MEDIUM', 'HIGH', 'EMERGENCY') DEFAULT 'MEDIUM',
      warden_remarks TEXT,
      resolved_at DATETIME,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
      FOREIGN KEY (hostel_id) REFERENCES hostels(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);
  console.log('✓ complaints table created or already exists');

  const [count] = await pool.query('SELECT COUNT(*) as c FROM complaints');
  if (count[0].c === 0) {
    await pool.query(`
      INSERT INTO complaints (student_id, student_name, student_prn, hostel_id, room_number, bed_number, category, title, description, status, urgency, warden_remarks, created_at)
      VALUES
      (1, 'Rahul Ashok Shinde', 'NACSC-2026-001', 1, '102', 'A', 'Plumbing', 'Bathroom shower tap leakage', 'Bathroom shower tap is continuously leaking and low water pressure.', 'PENDING', 'MEDIUM', 'Maintenance plumber informed', '2026-09-28 10:15:00'),
      (3, 'Amit Ramesh Deshmukh', 'NACSC-2026-003', 1, '205', 'B', 'Electrical', 'Ceiling fan regulator issue', 'Ceiling fan regulator stuck at maximum speed.', 'IN_PROGRESS', 'HIGH', 'Electrician scheduled for replacement', '2026-09-27 14:30:00'),
      (4, 'Suraj Sonawane', 'NACSC-2026-007', 1, '108', 'C', 'Wi-Fi / Internet', 'Floor 1 access point speed', 'Floor 1 access point connectivity drops frequently in evening hours.', 'RESOLVED', 'LOW', 'Router restarted and antenna adjusted', '2026-09-25 09:20:00'),
      (6, 'Aniket Shinde', '4342335367', 1, 'B-110', 'B-110-01', 'Electrical', 'Study table light fixture not working', 'The reading light fixture over study desk B-110-01 is flickering intermittently.', 'IN_PROGRESS', 'MEDIUM', 'Warden inspected; new LED bulb dispatched with electrician', '2026-09-29 16:45:00'),
      (2, 'Priya Sunil Kulkarni', 'NACSC-2026-002', 2, 'G-102', 'A', 'Plumbing', 'Bathroom tap issue', 'Bathroom wash basin tap leakage in wing 1.', 'PENDING', 'MEDIUM', 'Plumber scheduled for inspection', '2026-09-28 11:00:00')
    `);
    console.log('✓ Initial complaints seeded');
  } else {
    console.log('Complaints table already has ' + count[0].c + ' rows');
  }
}

setupComplaintsTable()
  .then(() => {
    console.log('Done!');
    process.exit(0);
  })
  .catch(e => {
    console.error('Error:', e);
    process.exit(1);
  });
