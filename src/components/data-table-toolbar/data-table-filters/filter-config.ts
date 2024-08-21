export const MAX_FILTER_DEPTH = parseInt(
  process.env.NEXT_PUBLIC_MAX_FILTER_DEPTH || '5',
  10,
)

export const ENABLE_NEGATION_OPERATION =
  process.env.NEXT_PUBLIC_ENABLE_NEGATION === 'true'

const NO_NEGATION = null

export const VALUE_TYPE = {
  always_be_true: 'always_be_true',
  date: 'date',
  select: 'select',
  multi_select: 'multi_select',
  number: 'number',
  text: 'text',
}

export const COMPOUND_OPERATOR = {
  and: 'and',
  or: 'or',
}

export const FILTER_CONFIG = {
  checkbox: {
    default_operator: 'equals',
    operators: {
      equals: {
        label: 'Is',
        negation: 'does_not_equal',
        value: {
          type: VALUE_TYPE.select,
          options: [
            { label: 'Checked', value: true },
            { label: 'Unchecked', value: false },
          ],
        },
      },
      does_not_equal: {
        label: 'Is not',
        negation: 'equals',
        value: {
          type: VALUE_TYPE.select,
          options: [
            { label: 'Checked', value: true },
            { label: 'Unchecked', value: false },
          ],
        },
      },
    },
  },
  date: {
    default_operator: 'is_not_empty',
    operators: {
      after: {
        label: 'Is after',
        negation: 'on_or_before',
        value: {
          type: VALUE_TYPE.date,
        },
      },
      before: {
        label: 'Is before',
        negation: 'on_or_after',
        value: {
          type: VALUE_TYPE.date,
        },
      },
      equals: {
        label: 'Is',
        negation: NO_NEGATION,
        value: {
          type: VALUE_TYPE.date,
        },
      },
      is_empty: {
        label: 'Is empty',
        negation: 'is_not_empty',
        value: {
          type: VALUE_TYPE.always_be_true,
        },
      },
      is_not_empty: {
        label: 'Is not empty',
        negation: 'is_empty',
        value: {
          type: VALUE_TYPE.always_be_true,
        },
      },
      on_or_after: {
        label: 'Is on or after',
        negation: 'before',
        value: {
          type: VALUE_TYPE.date,
        },
      },
      on_or_before: {
        label: 'Is on or before',
        negation: 'after',
        value: {
          type: VALUE_TYPE.date,
        },
      },
    },
  },
  multi_select: {
    default_operator: 'contains',
    operators: {
      contains: {
        label: 'Contains',
        negation: 'does_not_contain',
        value: {
          type: VALUE_TYPE.multi_select,
        },
      },
      does_not_contain: {
        label: 'Does not contain',
        negation: 'contains',
        value: {
          type: VALUE_TYPE.multi_select,
        },
      },
      is_empty: {
        label: 'Is empty',
        negation: 'is_not_empty',
        value: {
          type: VALUE_TYPE.always_be_true,
        },
      },
      is_not_empty: {
        label: 'Is not empty',
        negation: 'is_empty',
        value: {
          type: VALUE_TYPE.always_be_true,
        },
      },
    },
  },
  number: {
    default_operator: 'equals',
    operators: {
      does_not_equal: {
        label: '≠',
        negation: 'equals',
        value: {
          type: VALUE_TYPE.number,
        },
      },
      equals: {
        label: '=',
        negation: 'does_not_equal',
        value: {
          type: VALUE_TYPE.number,
        },
      },
      greater_than: {
        label: '>',
        negation: 'less_than_or_equal_to',
        value: {
          type: VALUE_TYPE.number,
        },
      },
      greater_than_or_equal_to: {
        label: '≥',
        negation: 'less_than',
        value: {
          type: VALUE_TYPE.number,
        },
      },
      is_empty: {
        label: 'Is empty',
        negation: 'is_not_empty',
        value: {
          type: VALUE_TYPE.always_be_true,
        },
      },
      is_not_empty: {
        label: 'Is not empty',
        negation: 'is_empty',
        value: {
          type: VALUE_TYPE.always_be_true,
        },
      },
      less_than: {
        label: '<',
        negation: 'greater_than_or_equal_to',
        value: {
          type: VALUE_TYPE.number,
        },
      },
      less_than_or_equal_to: {
        label: '≤',
        negation: 'greater_than',
        value: {
          type: VALUE_TYPE.number,
        },
      },
    },
  },
  rich_text: {
    default_operator: 'contains',
    operators: {
      contains: {
        label: 'Contains',
        negation: 'does_not_contain',
        value: {
          type: VALUE_TYPE.text,
        },
      },
      does_not_contain: {
        label: 'Does not contain',
        negation: 'contains',
        value: {
          type: VALUE_TYPE.text,
        },
      },
      does_not_equal: {
        label: 'Is not',
        negation: 'equals',
        value: {
          type: VALUE_TYPE.text,
        },
      },
      ends_with: {
        label: 'Ends with',
        negation: NO_NEGATION,
        value: {
          type: VALUE_TYPE.text,
        },
      },
      equals: {
        label: 'Is',
        negation: 'does_not_equal',
        value: {
          type: VALUE_TYPE.text,
        },
      },
      is_empty: {
        label: 'Is empty',
        negation: 'is_not_empty',
        value: {
          type: VALUE_TYPE.always_be_true,
        },
      },
      is_not_empty: {
        label: 'Is not empty',
        negation: 'is_empty',
        value: {
          type: VALUE_TYPE.always_be_true,
        },
      },
      starts_with: {
        label: 'Starts with',
        negation: NO_NEGATION,
        value: {
          type: VALUE_TYPE.text,
        },
      },
    },
  },
  title: {
    default_operator: 'contains',
    operators: {
      contains: {
        label: 'Contains',
        negation: 'does_not_contain',
        value: {
          type: VALUE_TYPE.text,
        },
      },
      does_not_contain: {
        label: 'Does not contain',
        negation: 'contains',
        value: {
          type: VALUE_TYPE.text,
        },
      },
      does_not_equal: {
        label: 'Is not',
        negation: 'equals',
        value: {
          type: VALUE_TYPE.text,
        },
      },
      ends_with: {
        label: 'Ends with',
        negation: NO_NEGATION,
        value: {
          type: VALUE_TYPE.text,
        },
      },
      equals: {
        label: 'Is',
        negation: 'does_not_equal',
        value: {
          type: VALUE_TYPE.text,
        },
      },
      is_empty: {
        label: 'Is empty',
        negation: 'is_not_empty',
        value: {
          type: VALUE_TYPE.always_be_true,
        },
      },
      is_not_empty: {
        label: 'Is not empty',
        negation: 'is_empty',
        value: {
          type: VALUE_TYPE.always_be_true,
        },
      },
      starts_with: {
        label: 'Starts with',
        negation: NO_NEGATION,
        value: {
          type: VALUE_TYPE.text,
        },
      },
    },
  },
  select: {
    default_operator: 'equals',
    operators: {
      equals: {
        label: 'Is',
        negation: 'does_not_equal',
        value: {
          type: VALUE_TYPE.select,
        },
      },
      does_not_equal: {
        label: 'Is not',
        negation: 'equals',
        value: {
          type: VALUE_TYPE.select,
        },
      },
      is_empty: {
        label: 'Is empty',
        negation: 'is_not_empty',
        value: {
          type: VALUE_TYPE.always_be_true,
        },
      },
      is_not_empty: {
        label: 'Is not empty',
        negation: 'is_empty',
        value: {
          type: VALUE_TYPE.always_be_true,
        },
      },
    },
  },
  timestamp: {},
  status: {
    default_operator: 'is_not_empty',
    operators: {
      equals: {
        label: 'Is',
        negation: 'does_not_equal',
        value: {
          type: VALUE_TYPE.select,
        },
      },
      does_not_equal: {
        label: 'Is not',
        negation: 'equals',
        value: {
          type: VALUE_TYPE.select,
        },
      },
      is_empty: {
        label: 'Is empty',
        negation: 'is_not_empty',
        value: {
          type: VALUE_TYPE.always_be_true,
        },
      },
      is_not_empty: {
        label: 'Is not empty',
        negation: 'is_empty',
        value: {
          type: VALUE_TYPE.always_be_true,
        },
      },
    },
  },
} as const
