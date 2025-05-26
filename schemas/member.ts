export default {
  name: 'member',
  title: 'Member',
  type: 'document',
  fields: [
    {
      name: 'name',
      title: 'Name',
      type: 'string',
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: 'email',
      title: 'Email',
      type: 'string',
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: 'role',
      title: 'Role',
      type: 'string',
      options: {
        list: [
          { title: 'Member', value: 'member' },
          { title: 'Officer', value: 'officer' },
          { title: 'Admin', value: 'admin' },
        ],
      },
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: 'image',
      title: 'Profile Image',
      type: 'image',
      options: {
        hotspot: true,
      },
    },
    {
      name: 'bio',
      title: 'Bio',
      type: 'text',
    },
  ],
} 