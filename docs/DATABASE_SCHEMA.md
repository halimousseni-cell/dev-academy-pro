# Dev Academy Pro — Schéma de base de données (MVP)

Base : SQLite (fichier `dev.db`) via Prisma. Compatible PostgreSQL (voir
[ARCHITECTURE.md §8](./ARCHITECTURE.md#8-migration-sqlite--postgresql)).

## Diagramme conceptuel

```
User ──< RefreshToken
User ──< AuditLog
User ──< UserBadge >── Badge
User ──< UserProgress >── Lesson
User ──< QuizAttempt >── Quiz

Module ──< Chapter ──< Lesson
Chapter ──< Quiz ──< QuizQuestion ──< QuizAnswer
```

## Tables

### User
| Champ | Type | Contraintes | Notes |
|---|---|---|---|
| id | String (cuid) | PK | |
| email | String | UNIQUE, NOT NULL | normalisé en minuscules |
| passwordHash | String | NOT NULL | Argon2id |
| firstName | String | NOT NULL | |
| lastName | String | NOT NULL | |
| role | Enum(STUDENT, INSTRUCTOR, ADMIN) | DEFAULT STUDENT | |
| mfaEnabled | Boolean | DEFAULT false | réservé (roadmap) |
| mfaSecret | String? | nullable, chiffré | réservé (roadmap) |
| failedLoginCount | Int | DEFAULT 0 | brute-force protection |
| lockedUntil | DateTime? | nullable | verrouillage temporaire |
| weeklyGoalMinutes | Int | DEFAULT 150 | objectif hebdo dashboard |
| createdAt | DateTime | DEFAULT now() | |
| updatedAt | DateTime | @updatedAt | |

### RefreshToken
| Champ | Type | Contraintes | Notes |
|---|---|---|---|
| id | String (cuid) | PK | |
| userId | String | FK → User.id | |
| tokenHash | String | UNIQUE, NOT NULL | SHA-256 du token, jamais en clair |
| expiresAt | DateTime | NOT NULL | |
| revokedAt | DateTime? | nullable | rotation/révocation |
| replacedByTokenHash | String? | nullable | traçabilité de rotation |
| userAgent | String? | nullable | détection connexion suspecte |
| ipAddress | String? | nullable | |
| createdAt | DateTime | DEFAULT now() | |

### AuditLog
| Champ | Type | Contraintes | Notes |
|---|---|---|---|
| id | String (cuid) | PK | |
| userId | String? | FK → User.id, nullable | nullable pour tentatives anonymes |
| action | String | NOT NULL | ex: `LOGIN_SUCCESS`, `LOGIN_FAILED`, `PASSWORD_CHANGED` |
| metadata | String? | JSON sérialisé | détails contextuels |
| ipAddress | String? | | |
| userAgent | String? | | |
| createdAt | DateTime | DEFAULT now() | |

### Module
| Champ | Type | Contraintes | Notes |
|---|---|---|---|
| id | String (cuid) | PK | |
| slug | String | UNIQUE | ex: `html-css-fondamentaux` |
| title | String | NOT NULL | |
| description | String | NOT NULL | |
| category | String | NOT NULL | ex: "Front-end", "Sécurité" |
| order | Int | NOT NULL | ordre d'affichage du parcours |
| estimatedMinutes | Int | NOT NULL | pour calcul "temps estimé" |
| published | Boolean | DEFAULT false | |

### Chapter
| Champ | Type | Contraintes | Notes |
|---|---|---|---|
| id | String (cuid) | PK | |
| moduleId | String | FK → Module.id | |
| slug | String | NOT NULL | unique par module |
| title | String | NOT NULL | |
| order | Int | NOT NULL | |

### Lesson
| Champ | Type | Contraintes | Notes |
|---|---|---|---|
| id | String (cuid) | PK | |
| chapterId | String | FK → Chapter.id | |
| title | String | NOT NULL | |
| order | Int | NOT NULL | |
| contentMd | String | NOT NULL | contenu Markdown (théorie, exemples) |
| type | Enum(THEORY, EXERCISE, PROJECT) | DEFAULT THEORY | |

### Quiz
| Champ | Type | Contraintes | Notes |
|---|---|---|---|
| id | String (cuid) | PK | |
| chapterId | String | FK → Chapter.id | |
| title | String | NOT NULL | |
| passingScore | Int | DEFAULT 70 | en % |
| timeLimitSeconds | Int? | nullable | questions chronométrées (roadmap) |

### QuizQuestion
| Champ | Type | Contraintes | Notes |
|---|---|---|---|
| id | String (cuid) | PK | |
| quizId | String | FK → Quiz.id | |
| order | Int | NOT NULL | |
| type | Enum(MCQ, TRUE_FALSE, CODE_FILL) | NOT NULL | |
| prompt | String | NOT NULL | énoncé |
| explanation | String | NOT NULL | correction détaillée |

### QuizAnswer
| Champ | Type | Contraintes | Notes |
|---|---|---|---|
| id | String (cuid) | PK | |
| questionId | String | FK → QuizQuestion.id | |
| label | String | NOT NULL | texte de la réponse |
| isCorrect | Boolean | DEFAULT false | |
| order | Int | NOT NULL | |

### QuizAttempt
| Champ | Type | Contraintes | Notes |
|---|---|---|---|
| id | String (cuid) | PK | |
| userId | String | FK → User.id | |
| quizId | String | FK → Quiz.id | |
| score | Int | NOT NULL | en % |
| passed | Boolean | NOT NULL | |
| answersJson | String | NOT NULL | snapshot des réponses données |
| createdAt | DateTime | DEFAULT now() | |

### UserProgress
| Champ | Type | Contraintes | Notes |
|---|---|---|---|
| id | String (cuid) | PK | |
| userId | String | FK → User.id | |
| lessonId | String | FK → Lesson.id | |
| status | Enum(NOT_STARTED, IN_PROGRESS, COMPLETED) | DEFAULT NOT_STARTED | |
| timeSpentSeconds | Int | DEFAULT 0 | cumul pour dashboard |
| completedAt | DateTime? | nullable | |
| UNIQUE(userId, lessonId) | | | |

### Badge
| Champ | Type | Contraintes | Notes |
|---|---|---|---|
| id | String (cuid) | PK | |
| code | String | UNIQUE | ex: `FIRST_QUIZ_PASSED` |
| title | String | NOT NULL | |
| description | String | NOT NULL | |
| icon | String | NOT NULL | nom d'icône (lucide-react) |

### UserBadge
| Champ | Type | Contraintes | Notes |
|---|---|---|---|
| id | String (cuid) | PK | |
| userId | String | FK → User.id | |
| badgeId | String | FK → Badge.id | |
| earnedAt | DateTime | DEFAULT now() | |
| UNIQUE(userId, badgeId) | | | |

## Index recommandés
- `User.email` (unique, recherche login)
- `RefreshToken.tokenHash` (unique, lookup rapide à chaque refresh)
- `RefreshToken.userId` (révocation globale)
- `UserProgress(userId, lessonId)` (unique, lecture dashboard)
- `AuditLog.userId`, `AuditLog.createdAt` (recherche audit)

## Notes de sécurité base de données
- Tous les accès passent par Prisma (requêtes paramétrées) — aucune
  concaténation de SQL brut.
- `passwordHash` et `tokenHash` ne stockent jamais de valeur en clair.
- Sauvegardes : en MVP local, copie périodique de `dev.db` documentée dans
  le README ; en production, sauvegardes chiffrées automatisées (roadmap).
