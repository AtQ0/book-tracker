```bash
book-tracker/
├── .next/
├── .swc/
├── .vscode/
├── docs/
├── node_modules/
├── prisma/
│   ├── schema.prisma
│   ├── migrations/
│   └── seed.ts
│
├── public/
│   └── images/
│
├── src/
│   ├── app/
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   │
│   │   ├── (auth)/
│   │   │   ├── layout.tsx
│   │   │   │
│   │   │   ├── signin/
│   │   │   │   ├── SigninCard.tsx
│   │   │   │   └── page.tsx
│   │   │   │
│   │   │   ├── set-password/
│   │   │   │   ├── SetPasswordCard.tsx
│   │   │   │   └── page.tsx
│   │   │   │
│   │   │   ├── signup/
│   │   │   │   ├── SignupCard.tsx
│   │   │   │   └── page.tsx
│   │   │   │
│   │   │   └── verify/
│   │   │       ├── VerifyCard.tsx
│   │   │       └── page.tsx
│   │   │
│   │   ├── api/
│   │   │   ├── auth/
│   │   │   │   ├── signin/
│   │   │   │   ├── resend/
│   │   │   │   ├── set-password/
│   │   │   │   ├── signup/
│   │   │   │   │   └── route.ts
│   │   │   │   └── verify/
│   │   │   │       └── route.ts
│   │   │   │
│   │   │   └── books/
│   │   │       └── route.ts
│   │   │
│   │   ├── books/
│   │   │   ├── BookListClient.tsx
│   │   │   └── page.tsx
│   │   │
│   │   └── books/[id]/
│   │       └── page.tsx
│   │
│   └── my/
│       └── shelf/
│
├── components/
│   ├── BackButton.tsx
│   │
│   ├── auth/
│   │   ├── AuthCard.tsx
│   │   ├── AuthForm.tsx
│   │   └── SessionProviderClient.tsx
│   │
│   ├── books/
│   │   ├── BookCard.tsx
│   │   ├── BookGrid.tsx
│   │   └── BookSortBar.tsx
│   │
│   ├── form/
│   │   └── Field.tsx
│   │
│   ├── layout/
│   │   ├── Container.tsx
│   │   └── Section.tsx
│   │
│   └── ui/
│       ├── Button.tsx
│       ├── Card.tsx
│       ├── Input.tsx
│       └── Label.tsx
│
├── hooks/
│
├── lib/
│   ├── auth-helpers.ts
│   ├── db.ts
│   │
│   ├── api/
│   │   └── auth.ts
│   │
│   └── validations/
│       ├── auth.ts
│       └── book.ts
│
├── server/
│   ├── auth.ts
│   ├── books.ts
│   ├── http.ts
│   │
│   ├── auth/
│   │   ├── config.ts
│   │   ├── reset-password.ts
│   │   ├── signup.ts
│   │   └── verifySignup.ts
│   │
│   └── mail/
│       ├── sendSignupEmail.ts
│       └── transporter.ts
│
├── types/
│
├── tests/
│   ├── e2e/
│   │
│   ├── integration/
│   │   ├── api/
│   │   │   ├── auth.verify.route.test.ts
│   │   │   └── books.route.test.ts
│   │   │
│   │   ├── pages/
│   │   │   └── books.page.test.tsx
│   │   │
│   │   └── server/
│   │       ├── getBooksFromDb.test.ts
│   │       └── verifySignup.test.ts
│   │
│   ├── setup/
│   │   └── jest.setup.ts
│   │
│   └── unit/
│       ├── components/
│       │   ├── auth/
│       │   │   ├── AuthCard.test.tsx
│       │   │   └── AuthForm.test.tsx
│       │   │
│       │   ├── books/
│       │   │   ├── BookCard.test.tsx
│       │   │   └── BookGrid.test.tsx
│       │   │
│       │   ├── form/
│       │   │   └── Field.test.tsx
│       │   │
│       │   ├── layout/
│       │   │   ├── Container.test.tsx
│       │   │   └── Section.test.tsx
│       │   │
│       │   └── ui/
│       │       ├── Button.test.tsx
│       │       ├── Card.test.tsx
│       │       ├── Input.test.tsx
│       │       └── Label.test.tsx
│       │
│       ├── hooks/
│       │
│       └── lib/
│           └── validations/
│               ├── book.dto.schema.test.ts
│               ├── book.query.schema.test.ts
│               └── sortFieldMap.test.ts
│
├── .env
├── .env.example
├── .env.local
├── .env.production
├── .gitignore
├── docker-compose.yml
├── eslint.config.mjs
├── jest.config.ts
├── next-env.d.ts
├── next.config.ts
├── package-lock.json
├── package.json
├── postcss.config.mjs
├── README.md
├── tsconfig.json
└── tsconfig.tsbuildinfo
```
