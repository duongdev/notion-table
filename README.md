# 👋

This project is for research and educational purpose. The project is a web application that displays a table view of a Notion database and allows users to sort and filter the database using the Notion API.

![image](https://github.com/user-attachments/assets/379ab7b3-24f9-4cce-a54e-e2710517b86a)

## Tech stack 🛠

- [Next.js](https://nextjs.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [shadcn/ui](https://ui.shadcn.com/)
- [Notion API](https://developers.notion.com/)
- [React Table](https://react-table.tanstack.com/)
- [Zustand](https://zustand.surge.sh/)
- [TypeScript](https://www.typescriptlang.org/)
- [Docker](https://www.docker.com/)

## Quick start 🚀

1. **Clone the repository.**

   ```shell
   git clone
   ```

2. **Configure the environment variables.**

   Create a `.env` file in the root of the project and add the following environment variables:

   ```shell
   NOTION_SECRET=<your-notion-secret>
   NOTION_DB_ID=<your-notion-db-id>
   NEXT_PUBLIC_MAX_FILTER_DEPTH=2
   NEXT_PUBLIC_ENABLE_NEGATION=true
   ```

3. **Install dependencies.**

   ```shell
   npm install
   ```

4. **Start the development server.**

   ```shell
    npm run dev
   ```

5. **Open the source code and start editing!**

   Your site is now running at `http://localhost:3000`!

## Running with Docker 🐳

1. **Update `next.config.mjs` file.**

   ```diff
   /** @type {import('next').NextConfig} */
   const nextConfig = {
      transpilePackages: ["geist"],
   +  output: "standalone",
   };

   export default nextConfig;
   ```

2. **Build the Docker image.**

   ```shell
   docker build -t notion-table-view .
   ```

3. **Run the Docker container.**

   ```shell
    docker run -p 3000:3000 notion-table-view
   ```

4. **Open the source code and start editing!**

   Your site is now running at `http://localhost:3000`!

## Key features ⭐

- [x] Build a table view UI for Notion databases

  - [x] Implement a basic table view given a Notion database as input.
  - [x] Support sorting.
  - [x] Support rearrangement and resizing of columns - expected behavior:
    - [x] Click and hold the column headings to drag them left or right.
    - [x] Resize columns by hovering over their edges, and dragging right or left.

- [x] Build a Notion filter UI for supporting database filters.

  - [x] Support the property types `checkbox , date , multi_select , number , rich_text ,
select , timestamp , status`.
  - [x] Support Compound filters with filter groups.
  - [x] The Notion API doc notes that it only supports two levels of nesting on compound filter conditions. Implement the filters such that the restriction on the levels of nesting is configurable e.g. could be increased to 3, 4, or more.
  - [ ] Implement unit tests for the Compound filters

- [x] Implement the NOT operator for compound filter conditions. Support compound filter conditions that contain only filter operators where the Notion API offers the logical negation e.g. `!(   )` is `is_not_empty` , `!( less_than )` is `greater_than_or_equal_to`
  - [x] For the filter conditions where Notion does not offer the logical negation, implement validation logic that prompts the user that the NOT operator is unsupported with the given compound filter conditions.
  - [x] For example: `!(( datePropertyX is after “2023-01-01” AND textPropertyY ends with “.com”) OR textPropertyZ starts with “www.”)` should indicate “Unsupported conditions for `NOT: ends with , starts with`
  - [ ] Include unit test cases for the NOT operator logic
