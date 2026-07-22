import type { Block } from 'payload'

export const StepsBlock: Block = {
  slug: 'stepsBlock',
  labels: { singular: 'Steps', plural: 'Steps Blocks' },
  fields: [
    { name: 'label', type: 'text' },
    { name: 'title', type: 'text' },
    { name: 'lead', type: 'textarea' },
    {
      name: 'steps',
      type: 'array',
      fields: [
        { name: 'num', type: 'text' },
        { name: 'title', type: 'text', required: true },
        { name: 'desc', type: 'textarea' },
      ],
    },
  ],
}

export const InfoListBlock: Block = {
  slug: 'infoListBlock',
  labels: { singular: 'Info List', plural: 'Info Lists' },
  fields: [
    { name: 'label', type: 'text' },
    { name: 'title', type: 'text' },
    { name: 'lead', type: 'textarea' },
    {
      name: 'items',
      type: 'array',
      fields: [
        { name: 'name', type: 'text', required: true },
        { name: 'description', type: 'textarea' },
      ],
    },
  ],
}

export const CalloutBlock: Block = {
  slug: 'calloutBlock',
  labels: { singular: 'Callout', plural: 'Callouts' },
  fields: [
    { name: 'label', type: 'text' },
    { name: 'body', type: 'textarea', required: true },
  ],
}

export const FormBlock: Block = {
  slug: 'formBlock',
  labels: { singular: 'Form', plural: 'Forms' },
  fields: [
    {
      name: 'formType',
      type: 'select',
      required: true,
      options: [
        { label: 'Financing pre-qual', value: 'financing-prequal' },
        { label: 'General contact', value: 'general-contact' },
      ],
    },
    { name: 'heading', type: 'text' },
  ],
}

export const MapBlock: Block = {
  slug: 'mapBlock',
  labels: { singular: 'Map', plural: 'Maps' },
  fields: [
    {
      name: 'size',
      type: 'select',
      defaultValue: 'full',
      options: [
        { label: 'Small', value: 'small' },
        { label: 'Full width', value: 'full' },
      ],
    },
  ],
}

export const StatsBlock: Block = {
  slug: 'statsBlock',
  labels: { singular: 'Stats', plural: 'Stats Blocks' },
  fields: [
    { name: 'label', type: 'text' },
    {
      name: 'stats',
      type: 'array',
      fields: [
        { name: 'value', type: 'text', required: true },
        { name: 'label', type: 'text', required: true },
        { name: 'description', type: 'textarea' },
      ],
    },
  ],
}

export const RichTextBlock: Block = {
  slug: 'richTextBlock',
  labels: { singular: 'Rich Text', plural: 'Rich Text Blocks' },
  fields: [{ name: 'content', type: 'richText' }],
}

export const pageBlocks = [
  StepsBlock,
  InfoListBlock,
  CalloutBlock,
  FormBlock,
  MapBlock,
  StatsBlock,
  RichTextBlock,
]
