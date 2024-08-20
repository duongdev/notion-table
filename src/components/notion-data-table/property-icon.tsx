import type { DataTableProperty } from '@/lib/notion/types'
import {
  CalendarIcon,
  CheckboxIcon,
  FrameIcon,
  LetterCaseCapitalizeIcon,
  ListBulletIcon,
  TextAlignLeftIcon,
  TriangleDownIcon,
} from '@radix-ui/react-icons'
import type { IconProps } from '@radix-ui/react-icons/dist/types'
import type { ForwardRefExoticComponent } from 'react'

export const PROPERTY_ICONS: Partial<
  Record<
    DataTableProperty['type'],
    ForwardRefExoticComponent<IconProps & React.RefAttributes<SVGSVGElement>>
  >
> = {
  title: LetterCaseCapitalizeIcon,
  number: FrameIcon,
  checkbox: CheckboxIcon,
  rich_text: TextAlignLeftIcon,
  select: TriangleDownIcon,
  multi_select: ListBulletIcon,
  date: CalendarIcon,
}

export const PropertyIcon: React.FC<
  { type: DataTableProperty['type'] } & IconProps
> = ({ type, ...props }) => {
  const Icon = PROPERTY_ICONS[type]

  if (!Icon) {
    return null
  }

  return <Icon {...props} />
}
