// src/commands/user-cv.seeder.ts

import { NestFactory } from '@nestjs/core';
import { AppModule }   from '../app.module';
import { DataSource }  from 'typeorm';
import { User }        from '../users/entities/user.entity';
import { Cv }          from '../cvs/entities/cv.entity';
import { Skill }       from '../skills/entities/skill.entity';
import * as bcrypt     from 'bcrypt';

import {
  randEmail,
  randFirstName,
  randLastName,
  randJobTitle,
  randNumber,
  randUuid,
} from '@ngneat/falso';

interface SeedUser {
  username: string;
  email:    string;
  password: string;
  role:     'admin' | 'user';
}

async function bootstrap() {
  const app       = await NestFactory.createApplicationContext(AppModule);
  const ds        = app.get<DataSource>(DataSource);
  const userRepo  = ds.getRepository(User);
  const cvRepo    = ds.getRepository(Cv);
  const skillRepo = ds.getRepository(Skill);

  const SKILL_NAMES = [
    'JavaScript','TypeScript','Python','Java','C#','Go',
    'Rust','SQL','HTML','CSS'
  ];
  const skillEntities = SKILL_NAMES.map(name =>
    skillRepo.create({ designation: name })
  );
  const savedSkills = await skillRepo.save(skillEntities);
  console.log(`✔️  Created ${savedSkills.length} skills`);

  const seeds: SeedUser[] = [
    { username: 'admin', email: 'aymensellaouti@gmail.com', password: 'Admin#1234', role: 'admin' },
    ...Array.from({ length: 10 }).map(() => ({
      username: randUuid().slice(0, 8),
      email:    randEmail(),
      password: 'User#1234',
      role:     'user' as const,
    })),
  ];

  const savedUsers: User[] = [];
  for (const s of seeds) {
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(s.password, salt);

    const u = userRepo.create({
      username: s.username,
      email:    s.email,
      password: hash,
      salt:     salt,
      role:     s.role,
    });
    const saved = await userRepo.save(u);
    savedUsers.push(saved);
    console.log(`Created ${s.role} "${s.username}"`);
  }

  // 5) Pour chaque user normal, génère 1–3 CVs et leur assigne 1–5 skills
  for (const user of savedUsers.filter(u => u.role === 'user')) {
    const cvCount = randNumber({ min: 1, max: 3 });
    for (let i = 0; i < cvCount; i++) {
      const nSkills  = randNumber({ min: 1, max: 5 });
      const shuffled = [...savedSkills].sort(() => 0.5 - Math.random());
      const pick     = shuffled.slice(0, nSkills);
      const cv = cvRepo.create({
        name:      randLastName(),
        firstname: randFirstName(),
        age:       randNumber({ min: 18, max: 65 }),
        cin:       randNumber({ min: 10000000, max: 99999999 }).toString(),
        job:       randJobTitle(),
        path:      `uploads/cvs/${randUuid()}.pdf`,
        user:      user,
        skills:    pick,
      });
      const savedCv = await cvRepo.save(cv);
      console.log(`CV#${savedCv.id} (skills: ${pick.map(s=>s.designation).join(', ')}) → ${user.username}`);
    }
  }

  console.log('Seeding users + cvs + skills terminé.');
  await app.close();
}

bootstrap().catch(err => {
  console.error('Seeding échoué:', err);
  process.exit(1);
});
