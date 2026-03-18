/**
 * SachaPay Demo Seed Script
 * Run: npm run seed
 *
 * Creates:
 *  - 1 Organisation (Ogosgate Secondary School)
 *  - 1 Admin, 1 Manager, 4 Staff
 *  - 15 days of attendance records per staff member
 *  - Bank accounts for all staff
 *  - 2 months of payroll history
 *  - Financial passports
 *  - Eligibility rules
 */

import 'dotenv/config';
import mongoose from 'mongoose';
import Organization    from '../models/Organization.js';
import User            from '../models/User.js';

async function seed() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('🌱 Connected. Wiping old data...');

  // Clean slate
  await Promise.all([
    Organization.deleteMany(),
    User.deleteMany(),
    Attendance.deleteMany(),
    EligibilityRule.deleteMany(),
    BankAccount.deleteMany(),
    PayrollRun.deleteMany(),
    Transfer.deleteMany(),
    FinancialPassport.deleteMany(),
  ]);

  // ── Organisation ──────────────────────────────────────────────────────────
  const org = await Organization.create({
    name:       'Ogosgate Secondary School',
    industry:   'Education',
    email:      'admin@ogosgate.edu.ng',
    phone:      '+234 802 345 6789',
    address:    'Ibadan, Oyo State, Nigeria',
    inviteCode: 'OGOS24'
  });
  console.log(`✅ Organisation: ${org.name} | Invite: ${org.inviteCode}`);

  // ── Eligibility Rules ─────────────────────────────────────────────────────
  await EligibilityRule.create({
    organizationId: org._id,
    thresholdPercent: 70,
    lateCountsAsPresent: true,
    graceDays: 1
  });

  // ── Users ─────────────────────────────────────────────────────────────────
  const admin = await User.create({
    organizationId: org._id,
    name: 'Amaka Okonkwo', email: 'amaka@ogosgate.edu.ng',
    password: 'Admin1234!', role: 'ADMIN',
    salary: 200000, department: 'Administration'
  });

  const manager = await User.create({
    organizationId: org._id,
    name: 'Emeka Nwosu', email: 'emeka@ogosgate.edu.ng',
    password: 'Staff1234!', role: 'MANAGER',
    salary: 150000, department: 'Senior Staff'
  });

  const staffMembers = await User.create([
    { organizationId: org._id, name: 'Chidi Eze',      email: 'chidi@ogosgate.edu.ng',  password: 'Staff1234!', role: 'STAFF', salary: 85000,  department: 'Science' },
    { organizationId: org._id, name: 'Ngozi Adeyemi',  email: 'ngozi@ogosgate.edu.ng',  password: 'Staff1234!', role: 'STAFF', salary: 90000,  department: 'Mathematics' },
    { organizationId: org._id, name: 'Taiwo Balogun',  email: 'taiwo@ogosgate.edu.ng',  password: 'Staff1234!', role: 'STAFF', salary: 80000,  department: 'English' },
    { organizationId: org._id, name: 'Kemi Adesanya',  email: 'kemi@ogosgate.edu.ng',   password: 'Staff1234!', role: 'STAFF', salary: 75000,  department: 'Social Studies' },
  ]);

  const allStaff = [manager, ...staffMembers];
  console.log(`✅ Users: ${allStaff.length + 1} created`);

  // ── Financial Passports ───────────────────────────────────────────────────
  await FinancialPassport.create([
    { userId: admin._id },
    ...allStaff.map(u => ({ userId: u._id }))
  ]);

  // ── Bank Accounts ─────────────────────────────────────────────────────────
  // In production these come from Paystack verification
  // For demo, we seed them as already verified
  const banks = [
    { name: 'GTBank',     code: '058' },
    { name: 'Access Bank',code: '044' },
    { name: 'Zenith Bank',code: '057' },
    { name: 'First Bank', code: '011' },
    { name: 'UBA',        code: '033' },
  ];

  await BankAccount.create(allStaff.map((u, i) => ({
    userId:         u._id,
    organizationId: org._id,
    bankName:       banks[i].name,
    bankCode:       banks[i].code,
    accountNumber:  `012345678${i}`,
    accountName:    u.name.toUpperCase(),
    recipientCode:  `RCP_demo_${u._id.toString().slice(-6)}`, // Fake Paystack codes for demo
    isVerified:     true,
    isPrimary:      true
  })));
  console.log(`✅ Bank accounts: ${allStaff.length} verified`);

  // ── Attendance Records (last 15 working days) ─────────────────────────────
  const getWorkingDays = (n) => {
    const days = [];
    const d = new Date();
    while (days.length < n) {
      d.setDate(d.getDate() - 1);
      if (d.getDay() !== 0 && d.getDay() !== 6) { // Skip weekends
        days.push(d.toISOString().split('T')[0]);
      }
    }
    return days.reverse();
  };

  const workingDays = getWorkingDays(15);

  // Each staff has a different attendance pattern to make the demo interesting
  const patterns = {
    [manager._id]:         ['P','P','P','P','P','P','P','P','P','P','P','P','P','P','P'], // Perfect
    [staffMembers[0]._id]: ['P','P','L','P','P','P','P','A','P','P','P','P','P','P','P'], // 1 absent — qualifies
    [staffMembers[1]._id]: ['P','P','P','P','P','P','P','P','P','P','P','P','P','P','P'], // Perfect
    [staffMembers[2]._id]: ['P','A','P','P','A','P','P','A','P','P','A','P','P','P','P'], // 4 absent — borderline
    [staffMembers[3]._id]: ['A','A','P','A','P','A','P','A','P','A','A','P','A','P','P'], // 8 absent — does NOT qualify
  };

  for (const user of allStaff) {
    const pat = patterns[user._id] || Array(15).fill('P');
    for (let i = 0; i < workingDays.length; i++) {
      const status = pat[i] === 'P' ? 'PRESENT' : pat[i] === 'L' ? 'LATE' : 'ABSENT';
      if (status === 'ABSENT') {
        // Just create the record with absent status — no check-in time
        await Attendance.create({
          userId: user._id, organizationId: org._id,
          date: workingDays[i], status: 'ABSENT'
        });
      } else {
        const checkIn  = new Date(`${workingDays[i]}T${status === 'LATE' ? '08:35' : '07:58'}:00`);
        const checkOut = new Date(`${workingDays[i]}T17:10:00`);
        await Attendance.create({
          userId: user._id, organizationId: org._id,
          date: workingDays[i], checkIn, checkOut,
          hoursWorked: 9.2,
          status,
          lateMinutes: status === 'LATE' ? 20 : 0
        });
      }
    }
  }
  console.log(`✅ Attendance: ${allStaff.length * 15} records`);

  // ── Previous month completed PayrollRun ───────────────────────────────────
  const lastMonth = new Date();
  lastMonth.setMonth(lastMonth.getMonth() - 1);
  const lastMonthStr = lastMonth.toISOString().substring(0, 7);

  const pastRun = await PayrollRun.create({
    organizationId: org._id,
    month: lastMonthStr,
    status: 'COMPLETED',
    totalStaff: allStaff.length,
    qualifiedCount: 4,       // Kemi didn't qualify last month either
    totalAmount: 390000,
    approvedBy: admin._id,
    approvedAt: new Date(lastMonth.setDate(25)),
    disbursedAt: new Date(lastMonth.setDate(28)),
    completedAt: new Date(lastMonth.setDate(28)),
  });

  // Create Transfer records for the 4 who qualified
  const qualifiedStaff = [manager, staffMembers[0], staffMembers[1], staffMembers[2]];
  const salaries = [150000, 85000, 90000, 65000]; // Taiwo had deductions

  await Transfer.create(qualifiedStaff.map((u, i) => ({
    payrollRunId:       pastRun._id,
    userId:             u._id,
    organizationId:     org._id,
    month:              lastMonthStr,
    baseSalary:         u.salary,
    deductions:         u.salary - salaries[i],
    finalAmount:        salaries[i],
    recipientCode:      `RCP_demo_${u._id.toString().slice(-6)}`,
    status:             'SUCCESS',
    paystackReference:  `TRF_${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
    paidAt:             new Date(lastMonth)
  })));

  // Update Financial Passports for paid staff
  for (let i = 0; i < qualifiedStaff.length; i++) {
    await FinancialPassport.findOneAndUpdate(
      { userId: qualifiedStaff[i]._id },
      {
        totalMonthsEmployed: 3,
        totalEarned: salaries[i] * 3,
        averageMonthlyIncome: salaries[i],
        paymentConsistencyScore: 100,
        attendanceConsistencyScore: 87,
        employmentHistory: [{
          organizationId: org._id,
          organizationName: org.name,
          industry: org.industry,
          from: new Date(Date.now() - 90 * 86400000).toISOString().substring(0, 7),
          to: null,
          averageSalary: salaries[i],
          monthsWorked: 3
        }]
      }
    );
  }

  console.log(`✅ Payroll history: 1 completed run, ${qualifiedStaff.length} transfers`);

  console.log('\n🎉 Seed complete!\n');
  console.log('─────────────────────────────────────────────');
  console.log('Demo Credentials:');
  console.log('─────────────────────────────────────────────');
  console.log('Admin:   amaka@ogosgate.edu.ng  / Admin1234!');
  console.log('Manager: emeka@ogosgate.edu.ng  / Staff1234!');
  console.log('Staff 1: chidi@ogosgate.edu.ng  / Staff1234!  → qualifies (1 absent)');
  console.log('Staff 2: ngozi@ogosgate.edu.ng  / Staff1234!  → qualifies (perfect)');
  console.log('Staff 3: taiwo@ogosgate.edu.ng  / Staff1234!  → borderline (4 absent)');
  console.log('Staff 4: kemi@ogosgate.edu.ng   / Staff1234!  → does NOT qualify');
  console.log('─────────────────────────────────────────────');
  console.log(`Invite Code: OGOS24`);
  console.log('─────────────────────────────────────────────\n');

  await mongoose.disconnect();
}

seed().catch(err => {
  console.error('Seed failed:', err);
  process.exit(1);
});