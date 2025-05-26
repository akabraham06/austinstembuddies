export default {
  name: 'partner',
  title: 'Partner',
  type: 'document',
  fields: [
    {
      name: 'name',
      title: 'School Name',
      type: 'string',
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: 'address',
      title: 'Address',
      type: 'string',
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: 'contactPerson',
      title: 'Contact Person',
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
      name: 'phone',
      title: 'Phone',
      type: 'string',
    },
    {
      name: 'logo',
      title: 'School Logo',
      type: 'image',
      options: {
        hotspot: true,
      },
    },
    {
      name: 'description',
      title: 'Partnership Description',
      type: 'text',
    },
  ],
} 