import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { env } from '../config/env';
import User from '../models/User';
import Trainer from '../models/Trainer';
import Category from '../models/Category';
import Review from '../models/Review';
import Booking from '../models/Booking';

const categories = [
  { name: 'Gym Training', slug: 'gym', icon: 'dumbbell', color: '#FF5722', gradient: 'linear-gradient(135deg, #FF5722 0%, #FF8A65 100%)', order: 1 },
  { name: 'Yoga', slug: 'yoga', icon: 'heart', color: '#7C4DFF', gradient: 'linear-gradient(135deg, #7C4DFF 0%, #B388FF 100%)', order: 2 },
  { name: 'Swimming', slug: 'swimming', icon: 'waves', color: '#00BCD4', gradient: 'linear-gradient(135deg, #00BCD4 0%, #4DD0E1 100%)', order: 3 },
  { name: 'Badminton', slug: 'badminton', icon: 'target', color: '#4CAF50', gradient: 'linear-gradient(135deg, #4CAF50 0%, #81C784 100%)', order: 4 },
  { name: 'Martial Arts', slug: 'martial-arts', icon: 'swords', color: '#F44336', gradient: 'linear-gradient(135deg, #F44336 0%, #E57373 100%)', order: 5 },
  { name: 'Dance', slug: 'dance', icon: 'music', color: '#E91E63', gradient: 'linear-gradient(135deg, #E91E63 0%, #F48FB1 100%)', order: 6 },
  { name: 'Cricket', slug: 'cricket', icon: 'trophy', color: '#FF9800', gradient: 'linear-gradient(135deg, #FF9800 0%, #FFB74D 100%)', order: 7 },
  { name: 'Football', slug: 'football', icon: 'circle-dot', color: '#2196F3', gradient: 'linear-gradient(135deg, #2196F3 0%, #64B5F6 100%)', order: 8 },
];

const trainerPassword = bcrypt.hashSync('Trainer@123', 12);

const trainersData = [
  { fullName: 'Arjun Mehta', email: 'arjun@trainers.app', category: 'gym', specializations: ['Strength Training', 'Body Building', 'Fat Loss'], experience: 8, rating: 4.9, totalReviews: 142, pricing: 1500, city: 'Mumbai', distance: 2.3, isPremium: true, bio: 'ISSA certified fitness professional with 8 years of transforming lives. Specializing in strength training and body recomposition. Former national-level powerlifter turned coach.', certifications: ['ISSA Certified Personal Trainer', 'ACE Nutrition Specialist', 'CPR/AED Certified'], languages: ['English', 'Hindi', 'Marathi'], sessionTypes: ['Personal Training', 'Group Sessions', 'Online Coaching'], availability: { monday: ['06:00','07:00','08:00','17:00','18:00','19:00','20:00'], tuesday: ['06:00','07:00','08:00','17:00','18:00','19:00','20:00'], wednesday: ['06:00','07:00','08:00','17:00','18:00','19:00'], thursday: ['06:00','07:00','08:00','17:00','18:00','19:00','20:00'], friday: ['06:00','07:00','08:00','17:00','18:00','19:00'], saturday: ['07:00','08:00','09:00','10:00'], sunday: [] }, achievements: ['Transformed 500+ clients', 'National Powerlifting Bronze 2019', "Featured in Men's Health India"] },
  { fullName: 'Sneha Kulkarni', email: 'sneha@trainers.app', category: 'yoga', specializations: ['Hatha Yoga', 'Prenatal Yoga', 'Meditation'], experience: 12, rating: 4.8, totalReviews: 198, pricing: 800, city: 'Pune', distance: 1.1, isPremium: true, bio: 'Yoga Alliance RYT-500 certified instructor with over a decade of teaching experience.', certifications: ['Yoga Alliance RYT-500', 'Prenatal Yoga Certification', 'Ayurveda Wellness Counselor'], languages: ['English', 'Hindi', 'Marathi'], sessionTypes: ['Personal Training', 'Group Sessions', 'Online Coaching'], availability: { monday: ['05:30','06:30','07:30','09:00','17:00','18:00'], tuesday: ['05:30','06:30','07:30','09:00','17:00','18:00'], wednesday: ['05:30','06:30','07:30','09:00'], thursday: ['05:30','06:30','07:30','09:00','17:00','18:00'], friday: ['05:30','06:30','07:30','09:00','17:00','18:00'], saturday: ['06:00','07:00','08:00','09:00'], sunday: ['07:00','08:00'] }, achievements: ['12+ years teaching experience', 'Trained 2000+ students', 'Yoga retreat host in Bali & Rishikesh'] },
  { fullName: 'Ravi Shankar', email: 'ravi@trainers.app', category: 'swimming', specializations: ['Competitive Swimming', 'Kids Swimming', 'Water Safety'], experience: 15, rating: 4.7, totalReviews: 89, pricing: 1200, city: 'Bangalore', distance: 3.5, isPremium: false, bio: 'Former state-level swimmer and certified aquatics instructor. 15 years of coaching.', certifications: ['American Red Cross WSI', 'ASCA Level 3 Coach', 'Lifeguard Certified'], languages: ['English', 'Hindi', 'Kannada'], sessionTypes: ['Personal Training', 'Group Sessions'], availability: { monday: ['06:00','07:00','08:00','16:00','17:00'], tuesday: ['06:00','07:00','08:00','16:00','17:00'], wednesday: ['06:00','07:00','08:00'], thursday: ['06:00','07:00','08:00','16:00','17:00'], friday: ['06:00','07:00','08:00','16:00','17:00'], saturday: ['06:00','07:00','08:00','09:00'], sunday: [] }, achievements: ['State-level gold medalist', 'Trained 50+ competitive swimmers'] },
  { fullName: 'Vikram Singh', email: 'vikram@trainers.app', category: 'martial-arts', specializations: ['Karate', 'Self Defense', 'Kids Martial Arts'], experience: 20, rating: 4.9, totalReviews: 256, pricing: 1000, city: 'Chandigarh', distance: 1.8, isPremium: true, bio: '5th Dan Black Belt in Shotokan Karate with 20 years of martial arts experience.', certifications: ['5th Dan Black Belt - JKA', 'National Level Coach - SAI', 'Sports Psychology Diploma'], languages: ['English', 'Hindi', 'Punjabi'], sessionTypes: ['Personal Training', 'Group Sessions'], availability: { monday: ['06:00','07:00','16:00','17:00','18:00'], tuesday: ['06:00','07:00','16:00','17:00','18:00'], wednesday: ['06:00','07:00','16:00','17:00','18:00'], thursday: ['06:00','07:00','16:00','17:00','18:00'], friday: ['06:00','07:00','16:00','17:00','18:00'], saturday: ['07:00','08:00','09:00','10:00'], sunday: ['08:00','09:00'] }, achievements: ['National Karate Gold 2015, 2017', 'Coached 3 national team members'] },
  { fullName: 'Neha Sharma', email: 'neha@trainers.app', category: 'dance', specializations: ['Bollywood', 'Contemporary', 'Zumba'], experience: 10, rating: 4.8, totalReviews: 175, pricing: 900, city: 'Hyderabad', distance: 2.0, isPremium: true, bio: 'Professional dancer and choreographer with performances at national events.', certifications: ['Zumba Licensed Instructor', 'Trinity College Dance Diploma'], languages: ['English', 'Hindi', 'Telugu'], sessionTypes: ['Personal Training', 'Group Sessions', 'Online Coaching'], availability: { monday: ['10:00','11:00','17:00','18:00','19:00'], tuesday: ['10:00','11:00','17:00','18:00','19:00'], wednesday: ['10:00','11:00','17:00','18:00'], thursday: ['10:00','11:00','17:00','18:00','19:00'], friday: ['10:00','11:00','17:00','18:00','19:00'], saturday: ['09:00','10:00','11:00','12:00'], sunday: ['10:00','11:00'] }, achievements: ['Choreographed 100+ events', 'Featured on Zee TV'] },
  { fullName: 'Mohammad Irfan', email: 'irfan@trainers.app', category: 'cricket', specializations: ['Batting', 'Fast Bowling', 'Fielding'], experience: 14, rating: 4.6, totalReviews: 67, pricing: 1300, city: 'Hyderabad', distance: 4.2, isPremium: false, bio: 'Former Ranji Trophy player with 14 years of cricket coaching.', certifications: ['BCCI Level 2 Coach', 'NCA Certified Trainer'], languages: ['English', 'Hindi', 'Urdu'], sessionTypes: ['Personal Training', 'Group Sessions'], availability: { monday: ['06:00','07:00','15:00','16:00','17:00'], tuesday: ['06:00','07:00','15:00','16:00','17:00'], wednesday: ['06:00','07:00'], thursday: ['06:00','07:00','15:00','16:00','17:00'], friday: ['06:00','07:00','15:00','16:00','17:00'], saturday: ['06:00','07:00','08:00','09:00'], sunday: ['07:00','08:00','09:00'] }, achievements: ['Ranji Trophy 2012-2016', '3 players coached to IPL trials'] },
  { fullName: 'Priyanka Das', email: 'priyanka@trainers.app', category: 'gym', specializations: ["Women's Fitness", 'HIIT', 'Functional Training'], experience: 6, rating: 4.7, totalReviews: 113, pricing: 1200, city: 'Kolkata', distance: 1.5, isPremium: false, bio: 'Certified fitness coach specializing in women\'s health and functional training.', certifications: ['ACE Personal Trainer', 'Functional Movement Screen (FMS)'], languages: ['English', 'Hindi', 'Bengali'], sessionTypes: ['Personal Training', 'Group Sessions', 'Online Coaching'], availability: { monday: ['06:00','07:00','08:00','10:00','17:00','18:00'], tuesday: ['06:00','07:00','08:00','10:00','17:00','18:00'], wednesday: ['06:00','07:00','08:00','10:00'], thursday: ['06:00','07:00','08:00','10:00','17:00','18:00'], friday: ['06:00','07:00','08:00','10:00','17:00','18:00'], saturday: ['07:00','08:00','09:00'], sunday: [] }, achievements: ['Trained 300+ women clients', 'Kolkata Fitness Expo Speaker 2025'] },
  { fullName: 'Aakash Patel', email: 'aakash@trainers.app', category: 'badminton', specializations: ['Singles', 'Doubles Strategy', 'Junior Coaching'], experience: 11, rating: 4.8, totalReviews: 94, pricing: 1100, city: 'Ahmedabad', distance: 2.8, isPremium: true, bio: 'National-level badminton player and BAI certified coach.', certifications: ['BAI Level 2 Coach', 'BWF Shuttle Time Tutor'], languages: ['English', 'Hindi', 'Gujarati'], sessionTypes: ['Personal Training', 'Group Sessions'], availability: { monday: ['06:00','07:00','08:00','16:00','17:00','18:00'], tuesday: ['06:00','07:00','08:00','16:00','17:00','18:00'], wednesday: ['06:00','07:00','08:00'], thursday: ['06:00','07:00','08:00','16:00','17:00','18:00'], friday: ['06:00','07:00','08:00','16:00','17:00','18:00'], saturday: ['06:00','07:00','08:00','09:00','10:00'], sunday: ['07:00','08:00'] }, achievements: ['National Badminton Quarterfinalist', '10+ state-level players coached'] },
  { fullName: 'Lakshmi Iyer', email: 'lakshmi@trainers.app', category: 'yoga', specializations: ['Ashtanga Yoga', 'Power Yoga', 'Corporate Wellness'], experience: 9, rating: 4.6, totalReviews: 128, pricing: 1000, city: 'Chennai', distance: 3.0, isPremium: false, bio: 'Dynamic yoga instructor bridging traditional Ashtanga with modern fitness.', certifications: ['Yoga Alliance RYT-200', 'Corporate Wellness Coach'], languages: ['English', 'Hindi', 'Tamil'], sessionTypes: ['Personal Training', 'Group Sessions', 'Online Coaching'], availability: { monday: ['05:00','06:00','07:00','08:00','18:00','19:00'], tuesday: ['05:00','06:00','07:00','08:00','18:00','19:00'], wednesday: ['05:00','06:00','07:00','08:00'], thursday: ['05:00','06:00','07:00','08:00','18:00','19:00'], friday: ['05:00','06:00','07:00','08:00','18:00','19:00'], saturday: ['06:00','07:00','08:00'], sunday: ['06:00','07:00'] }, achievements: ['Corporate programs for TCS, Infosys', '9 years teaching'] },
  { fullName: 'Kabir Khan', email: 'kabir@trainers.app', category: 'football', specializations: ['Tactical Training', 'Goalkeeping', 'Youth Development'], experience: 13, rating: 4.7, totalReviews: 76, pricing: 1400, city: 'Delhi NCR', distance: 5.0, isPremium: true, bio: 'AFC B License coach and former I-League professional.', certifications: ['AFC B License', 'FIFA Grassroots Certificate', 'UEFA C License'], languages: ['English', 'Hindi'], sessionTypes: ['Personal Training', 'Group Sessions'], availability: { monday: ['06:00','07:00','15:00','16:00','17:00'], tuesday: ['06:00','07:00','15:00','16:00','17:00'], wednesday: ['06:00','07:00','15:00','16:00'], thursday: ['06:00','07:00','15:00','16:00','17:00'], friday: ['06:00','07:00','15:00','16:00','17:00'], saturday: ['07:00','08:00','09:00','10:00'], sunday: ['08:00','09:00'] }, achievements: ['I-League professional 2011-2016', '200+ youth players developed'] },
  { fullName: 'Tanvi Reddy', email: 'tanvi@trainers.app', category: 'gym', specializations: ['CrossFit', 'Olympic Lifting', 'Sports Performance'], experience: 7, rating: 4.9, totalReviews: 89, pricing: 1800, city: 'Bangalore', distance: 2.1, isPremium: true, bio: 'CrossFit Level 2 trainer and competitive weightlifter.', certifications: ['CrossFit Level 2 Trainer', 'NSCA-CSCS'], languages: ['English', 'Hindi', 'Telugu'], sessionTypes: ['Personal Training', 'Group Sessions'], availability: { monday: ['05:30','06:30','07:30','16:30','17:30','18:30'], tuesday: ['05:30','06:30','07:30','16:30','17:30','18:30'], wednesday: ['05:30','06:30','07:30'], thursday: ['05:30','06:30','07:30','16:30','17:30','18:30'], friday: ['05:30','06:30','07:30','16:30','17:30','18:30'], saturday: ['06:00','07:00','08:00','09:00'], sunday: [] }, achievements: ['CrossFit Regional Competitor 2024', 'State Weightlifting Gold'] },
  { fullName: 'Sanjay Deshmukh', email: 'sanjay@trainers.app', category: 'martial-arts', specializations: ['Taekwondo', 'Kickboxing', 'MMA Basics'], experience: 16, rating: 4.5, totalReviews: 112, pricing: 900, city: 'Pune', distance: 3.2, isPremium: false, bio: '4th Dan Black Belt in Taekwondo with 16 years of competition and coaching.', certifications: ['4th Dan Taekwondo - WTF', 'Kickboxing Instructor Level 3'], languages: ['English', 'Hindi', 'Marathi'], sessionTypes: ['Personal Training', 'Group Sessions'], availability: { monday: ['06:30','07:30','17:00','18:00','19:00'], tuesday: ['06:30','07:30','17:00','18:00','19:00'], wednesday: ['06:30','07:30','17:00','18:00'], thursday: ['06:30','07:30','17:00','18:00','19:00'], friday: ['06:30','07:30','17:00','18:00','19:00'], saturday: ['07:00','08:00','09:00'], sunday: ['08:00','09:00'] }, achievements: ['National Taekwondo Silver 2018', '16 years experience'] },
  { fullName: 'Divya Nair', email: 'divya@trainers.app', category: 'dance', specializations: ['Classical Bharatanatyam', 'Semi-Classical', 'Choreography'], experience: 18, rating: 4.9, totalReviews: 203, pricing: 1100, city: 'Chennai', distance: 1.9, isPremium: true, bio: 'Kalaimamani award-winning Bharatanatyam dancer and choreographer.', certifications: ['Kalaimamani Award', 'MA in Bharatanatyam'], languages: ['English', 'Hindi', 'Tamil', 'Malayalam'], sessionTypes: ['Personal Training', 'Group Sessions', 'Online Coaching'], availability: { monday: ['09:00','10:00','11:00','16:00','17:00'], tuesday: ['09:00','10:00','11:00','16:00','17:00'], wednesday: ['09:00','10:00','11:00'], thursday: ['09:00','10:00','11:00','16:00','17:00'], friday: ['09:00','10:00','11:00','16:00','17:00'], saturday: ['09:00','10:00','11:00','12:00'], sunday: [] }, achievements: ['Kalaimamani Award 2022', '500+ stage performances'] },
  { fullName: 'Rohan Kapoor', email: 'rohan@trainers.app', category: 'swimming', specializations: ['Open Water Swimming', 'Triathlon Prep', 'Adult Beginners'], experience: 9, rating: 4.6, totalReviews: 58, pricing: 1500, city: 'Delhi NCR', distance: 6.5, isPremium: false, bio: 'Triathlon competitor and swimming coach for adult beginners.', certifications: ['STA Swimming Teacher', 'Triathlon Coach Level 2'], languages: ['English', 'Hindi'], sessionTypes: ['Personal Training', 'Group Sessions'], availability: { monday: ['06:00','07:00','17:00','18:00','19:00'], tuesday: ['06:00','07:00','17:00','18:00','19:00'], wednesday: ['06:00','07:00'], thursday: ['06:00','07:00','17:00','18:00','19:00'], friday: ['06:00','07:00','17:00','18:00','19:00'], saturday: ['06:00','07:00','08:00'], sunday: ['07:00','08:00'] }, achievements: ['Ironman 70.3 finisher', '200+ adults taught to swim'] },
  { fullName: 'Fatima Sheikh', email: 'fatima@trainers.app', category: 'badminton', specializations: ["Women's Badminton", 'Doubles', 'Footwork'], experience: 8, rating: 4.7, totalReviews: 71, pricing: 950, city: 'Pune', distance: 2.4, isPremium: false, bio: 'Former university champion and passionate badminton coach.', certifications: ['BAI Level 1 Coach', 'Sports Science Certificate'], languages: ['English', 'Hindi', 'Marathi', 'Urdu'], sessionTypes: ['Personal Training', 'Group Sessions'], availability: { monday: ['07:00','08:00','09:00','16:00','17:00'], tuesday: ['07:00','08:00','09:00','16:00','17:00'], wednesday: ['07:00','08:00','09:00'], thursday: ['07:00','08:00','09:00','16:00','17:00'], friday: ['07:00','08:00','09:00','16:00','17:00'], saturday: ['07:00','08:00','09:00','10:00'], sunday: [] }, achievements: ['University Badminton Champion 2017', "Women's sports advocate"] },
  { fullName: 'Dev Thakur', email: 'dev@trainers.app', category: 'gym', specializations: ['Calisthenics', 'Bodyweight Training', 'Mobility'], experience: 5, rating: 4.8, totalReviews: 96, pricing: 1000, city: 'Pune', distance: 1.3, isPremium: false, bio: 'Calisthenics athlete proving you don\'t need a gym to get fit.', certifications: ['NASM-CPT', 'Calisthenics Movement Certified'], languages: ['English', 'Hindi', 'Marathi'], sessionTypes: ['Personal Training', 'Group Sessions', 'Online Coaching'], availability: { monday: ['06:00','07:00','08:00','17:00','18:00','19:00'], tuesday: ['06:00','07:00','08:00','17:00','18:00','19:00'], wednesday: ['06:00','07:00','08:00'], thursday: ['06:00','07:00','08:00','17:00','18:00','19:00'], friday: ['06:00','07:00','08:00','17:00','18:00','19:00'], saturday: ['07:00','08:00','09:00','10:00'], sunday: ['08:00','09:00'] }, achievements: ['Muscle-up national record attempt', '100K YouTube subscribers'] },
  { fullName: 'Simran Kaur', email: 'simran@trainers.app', category: 'yoga', specializations: ['Kundalini Yoga', 'Breathwork', 'Sound Healing'], experience: 7, rating: 4.9, totalReviews: 145, pricing: 1200, city: 'Delhi NCR', distance: 3.8, isPremium: true, bio: 'Kundalini yoga teacher and sound healer combining ancient traditions with modern wellness.', certifications: ['KRI Kundalini Yoga Teacher', 'Sound Healing Practitioner'], languages: ['English', 'Hindi', 'Punjabi'], sessionTypes: ['Personal Training', 'Group Sessions', 'Online Coaching'], availability: { monday: ['05:00','06:00','07:00','18:00','19:00'], tuesday: ['05:00','06:00','07:00','18:00','19:00'], wednesday: ['05:00','06:00','07:00'], thursday: ['05:00','06:00','07:00','18:00','19:00'], friday: ['05:00','06:00','07:00','18:00','19:00'], saturday: ['06:00','07:00','08:00'], sunday: ['07:00','08:00'] }, achievements: ['500+ students taught', 'Retreats in Dharamsala & Goa'] },
  { fullName: 'Ajay Yadav', email: 'ajay@trainers.app', category: 'cricket', specializations: ['Spin Bowling', 'Batting', 'Youth Cricket'], experience: 11, rating: 4.5, totalReviews: 53, pricing: 1000, city: 'Lucknow', distance: 2.7, isPremium: false, bio: 'Experienced cricket coach with a focus on spin bowling artistry.', certifications: ['BCCI Level 1 Coach', 'Cricket Analytics Certificate'], languages: ['English', 'Hindi'], sessionTypes: ['Personal Training', 'Group Sessions'], availability: { monday: ['06:00','07:00','16:00','17:00'], tuesday: ['06:00','07:00','16:00','17:00'], wednesday: ['06:00','07:00'], thursday: ['06:00','07:00','16:00','17:00'], friday: ['06:00','07:00','16:00','17:00'], saturday: ['06:00','07:00','08:00','09:00'], sunday: ['07:00','08:00'] }, achievements: ['UP State Cricket Team 2014-2018', 'BCCI certified'] },
  { fullName: 'Meghana Rao', email: 'meghana@trainers.app', category: 'dance', specializations: ['Hip Hop', 'Street Dance', 'Kids Dance'], experience: 6, rating: 4.7, totalReviews: 88, pricing: 800, city: 'Bangalore', distance: 4.5, isPremium: false, bio: 'Hip hop dancer from India\'s Got Talent making street dance fun for all ages.', certifications: ['UDO Dance Instructor', 'Kids Dance Safety Certified'], languages: ['English', 'Hindi', 'Kannada'], sessionTypes: ['Personal Training', 'Group Sessions', 'Online Coaching'], availability: { monday: ['10:00','11:00','16:00','17:00','18:00'], tuesday: ['10:00','11:00','16:00','17:00','18:00'], wednesday: ['10:00','11:00'], thursday: ['10:00','11:00','16:00','17:00','18:00'], friday: ['10:00','11:00','16:00','17:00','18:00'], saturday: ['09:00','10:00','11:00'], sunday: ['10:00','11:00'] }, achievements: ["India's Got Talent semifinalist", 'National Hip Hop Championship 3rd'] },
  { fullName: 'Rahul Joshi', email: 'rahul@trainers.app', category: 'football', specializations: ['Striker Training', 'Fitness Conditioning', 'School Programs'], experience: 10, rating: 4.6, totalReviews: 62, pricing: 1100, city: 'Mumbai', distance: 3.1, isPremium: false, bio: 'AIFF licensed coach with experience coaching school and college football teams.', certifications: ['AIFF D License', 'FIFA Grassroots Certificate'], languages: ['English', 'Hindi', 'Marathi'], sessionTypes: ['Personal Training', 'Group Sessions'], availability: { monday: ['06:00','07:00','15:30','16:30','17:30'], tuesday: ['06:00','07:00','15:30','16:30','17:30'], wednesday: ['06:00','07:00'], thursday: ['06:00','07:00','15:30','16:30','17:30'], friday: ['06:00','07:00','15:30','16:30','17:30'], saturday: ['07:00','08:00','09:00'], sunday: ['07:00','08:00','09:00'] }, achievements: ['AIFF licensed', '5 school championship wins'] },
];

async function seed() {
  try {
    await mongoose.connect(env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing data
    await Promise.all([
      User.deleteMany({}),
      Trainer.deleteMany({}),
      Category.deleteMany({}),
      Review.deleteMany({}),
      Booking.deleteMany({}),
    ]);
    console.log('🗑️  Cleared existing data');

    // Seed categories
    const cats = await Category.insertMany(categories);
    console.log(`📁 Seeded ${cats.length} categories`);

    // Seed trainers (password pre-hashed)
    const trainers = [];
    for (const t of trainersData) {
      const trainer = new Trainer({
        ...t,
        password: trainerPassword,
        priceUnit: 'per session',
        categories: [t.category],
        verificationStatus: 'verified',
        portfolioImages: [],
      });
      // Skip password hashing since we pre-hashed
      await trainer.save();
      trainers.push(trainer);
    }
    console.log(`👨‍🏫 Seeded ${trainers.length} trainers`);

    // Seed admin user
    const admin = new User({
      name: 'Admin',
      email: 'admin@trainersapp.com',
      password: 'Admin@123',
      role: 'admin',
      isVerified: true,
    });
    await admin.save();

    // Seed sample users
    const users = [];
    const sampleUsers = [
      { name: 'Rohit Sharma', email: 'rohit@test.com', password: 'User@123', city: 'Mumbai' },
      { name: 'Priya Kapoor', email: 'priya@test.com', password: 'User@123', city: 'Delhi NCR' },
      { name: 'Ananya Patel', email: 'ananya@test.com', password: 'User@123', city: 'Bangalore' },
    ];
    for (const u of sampleUsers) {
      const user = new User({ ...u, isVerified: true });
      await user.save();
      users.push(user);
    }
    console.log(`👤 Seeded ${users.length + 1} users (including admin)`);

    // Seed sample reviews
    const reviewsData = [
      { userId: users[0]._id, trainerId: trainers[0]._id, rating: 5, comment: 'Arjun completely changed my approach to fitness. Lost 18kg in 6 months.' },
      { userId: users[1]._id, trainerId: trainers[0]._id, rating: 5, comment: 'Incredibly knowledgeable and motivating trainer.' },
      { userId: users[2]._id, trainerId: trainers[1]._id, rating: 5, comment: 'Sneha\'s prenatal yoga sessions were a lifesaver.' },
      { userId: users[0]._id, trainerId: trainers[3]._id, rating: 5, comment: 'Vikram sir is the real deal. Unmatched discipline.' },
      { userId: users[1]._id, trainerId: trainers[4]._id, rating: 5, comment: 'Neha makes every class so fun!' },
    ];
    const reviews = await Review.insertMany(reviewsData);
    console.log(`⭐ Seeded ${reviews.length} reviews`);

    // Seed sample bookings
    const bookingsData = [
      { userId: users[0]._id, trainerId: trainers[0]._id, bookingDate: new Date('2026-05-25'), timeSlot: '07:00', sessionType: 'Personal Training', price: 1500, bookingStatus: 'confirmed' as const, paymentStatus: 'paid' as const },
      { userId: users[1]._id, trainerId: trainers[1]._id, bookingDate: new Date('2026-05-26'), timeSlot: '06:30', sessionType: 'Group Sessions', price: 800, bookingStatus: 'pending' as const, paymentStatus: 'pending' as const },
      { userId: users[2]._id, trainerId: trainers[4]._id, bookingDate: new Date('2026-05-27'), timeSlot: '18:00', sessionType: 'Online Coaching', price: 900, bookingStatus: 'confirmed' as const, paymentStatus: 'paid' as const },
    ];
    const bookings = await Booking.insertMany(bookingsData);
    console.log(`📅 Seeded ${bookings.length} bookings`);

    console.log('\n✅ Database seeded successfully!');
    console.log('\n📋 Test Credentials:');
    console.log('   Admin:   admin@trainersapp.com / Admin@123');
    console.log('   User:    rohit@test.com / User@123');
    console.log('   Trainer: arjun@trainers.app / Trainer@123\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seed error:', error);
    process.exit(1);
  }
}

seed();
