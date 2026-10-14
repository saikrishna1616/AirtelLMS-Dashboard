/* Deterministic, fictional training data. No employee data or network requests. */
(function (root) {
  'use strict';
  const snapshot = '2026-10-14';
  const circles = ['Delhi NCR', 'Maharashtra', 'Karnataka', 'Tamil Nadu', 'West Bengal', 'Telangana'];
  const programs = [
    { id: 'P01', name: '5G Network Essentials', category: 'Technical', duration: 12 },
    { id: 'P02', name: 'Customer Experience', category: 'Service', duration: 8 },
    { id: 'P03', name: 'Cybersecurity & Compliance', category: 'Compliance', duration: 6 },
    { id: 'P04', name: 'Retail Sales Excellence', category: 'Sales', duration: 10 },
    { id: 'P05', name: 'Fiber Installation & Safety', category: 'Technical', duration: 16 },
    { id: 'P06', name: 'Leadership Foundations', category: 'Leadership', duration: 14 }
  ];
  const trainers = ['Demo trainer A', 'Demo trainer B', 'Demo trainer C', 'Demo trainer D', 'Demo trainer E', 'Demo trainer F'];
  let seed = 141026;
  function random() { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed / 4294967296; }
  function iso(date) { return date.toISOString().slice(0, 10); }
  const learners = Array.from({ length: 480 }, (_, i) => ({ id: 'DEMO-' + String(i + 1).padStart(4, '0'), name: 'Demo learner ' + String(i + 1).padStart(3, '0'), circle: circles[i % circles.length], role: ['Network engineer', 'Retail associate', 'Service executive', 'Team lead'][i % 4] }));
  const batches = [], enrollments = [];
  for (let month = 4; month <= 10; month++) {
    circles.forEach((circle, c) => {
      const program = programs[(month + c) % programs.length];
      const start = new Date(Date.UTC(2026, month - 1, month === 10 ? 3 + c : 3 + c * 2));
      const due = new Date(start); due.setUTCDate(due.getUTCDate() + 21);
      const batch = { id: 'ATL-26-' + String(batches.length + 1).padStart(3, '0'), programId: program.id, circle, trainer: trainers[c], start: iso(start), due: iso(due), capacity: 44 };
      batches.push(batch);
      const count = 29 + Math.floor(random() * 13);
      const pool = learners.filter(l => l.circle === circle).slice();
      for (let i = pool.length - 1; i > 0; i--) { const j = Math.floor(random() * (i + 1)); [pool[i], pool[j]] = [pool[j], pool[i]]; }
      for (let i = 0; i < count; i++) {
        const learner = pool[i];
        const chance = month === 10 ? .25 : month === 9 ? .64 : .86;
        const complete = random() < chance - (program.id === 'P05' ? .13 : 0) - (c === 4 ? .08 : 0);
        const progress = complete ? 100 : random() < .18 ? 0 : 10 + Math.floor(random() * 80);
        const score = complete ? 48 + Math.floor(random() * 53) : null;
        const completedAt = complete ? iso(new Date(Math.min(Date.UTC(2026, 9, 14), start.getTime() + (5 + Math.floor(random() * 16)) * 86400000))) : null;
        enrollments.push({ id: 'ENR-' + String(enrollments.length + 1).padStart(5, '0'), learnerId: learner.id, learnerName: learner.name, role: learner.role, batchId: batch.id, programId: program.id, circle, enrolledAt: batch.start, due: batch.due, completedAt, progress, score, status: complete ? 'Completed' : progress === 0 ? 'Not started' : 'In progress' });
      }
    });
  }
  root.AirtelData = Object.freeze({ snapshot, circles, programs, learners, batches, enrollments, seed: 141026 });
})(globalThis);
