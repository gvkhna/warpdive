import {ScrollArea} from '@/components/ui/scroll-area'
import {cn} from '@/lib/utils'
import * as AccordionPrimitive from '@radix-ui/react-accordion'
import {FileIcon, FolderIcon, FolderOpenIcon} from 'lucide-react'
import React, {
  createContext,
  forwardRef,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactElement,
  type ReactNode
} from 'react'
import {Button} from '@/components/ui/button'

// var diffTypeColor = map[DiffType]*color.Color{
// 	Added:      color.New(color.FgGreen),
// 	Removed:    color.New(color.FgRed),
// 	Modified:   color.New(color.FgYellow),
// 	Unmodified: color.New(color.Reset),
// }

// const (
// 	newLine              = "\n"
// 	noBranchSpace        = "    "
// 	branchSpace          = "│   "
// 	middleItem           = "├─"
// 	lastItem             = "└─"
// 	whiteoutPrefix       = ".wh."
// 	doubleWhiteoutPrefix = ".wh..wh.."
// 	uncollapsedItem      = "─ "
// 	collapsedItem        = "⊕ "
// )

type TreeViewElement = {
  id: string
  name: string
  isSelectable?: boolean
  children?: TreeViewElement[]
}

type TreeContextProps = {
  selectedId: string | undefined
  expendedItems: string[] | undefined
  indicator: boolean
  handleExpand: (id: string) => void
  selectItem: (id: string) => void
  setExpendedItems?: React.Dispatch<React.SetStateAction<string[] | undefined>>
  openIcon?: React.ReactNode
  closeIcon?: React.ReactNode
  direction: 'rtl' | 'ltr'
}

const TreeContext = createContext<TreeContextProps | null>(null)

const useTree = () => {
  const context = useContext(TreeContext)
  if (!context) {
    throw new Error('useTree must be used within a TreeProvider')
  }
  return context
}

interface TreeViewComponentProps extends React.HTMLAttributes<HTMLDivElement> {}

type Direction = 'rtl' | 'ltr' | undefined

type TreeViewProps = {
  initialSelectedId?: string
  indicator?: boolean
  elements?: TreeViewElement[]
  initialExpendedItems?: string[]
  openIcon?: React.ReactNode
  closeIcon?: React.ReactNode
} & TreeViewComponentProps

const Tree = forwardRef<HTMLDivElement, TreeViewProps>(
  (
    {
      className,
      elements,
      initialSelectedId,
      initialExpendedItems,
      children,
      indicator = true,
      openIcon,
      closeIcon,
      dir,
      ...props
    },
    ref
  ) => {
    const [selectedId, setSelectedId] = useState<string | undefined>(initialSelectedId)
    const [expendedItems, setExpendedItems] = useState<string[] | undefined>(initialExpendedItems)

    const selectItem = useCallback((id: string) => {
      setSelectedId(id)
    }, [])

    const handleExpand = useCallback((id: string) => {
      setExpendedItems((prev) => {
        if (prev?.includes(id)) {
          return prev.filter((item) => item !== id)
        }
        return [...(prev ?? []), id]
      })
    }, [])

    const expandSpecificTargetedElements = useCallback((elements_?: TreeViewElement[], selectId?: string) => {
      if (!elements_ || !selectId) return
      const findParent = (currentElement: TreeViewElement, currentPath: string[] = []) => {
        const isSelectable = currentElement.isSelectable ?? true
        const newPath = [...currentPath, currentElement.id]
        if (currentElement.id === selectId) {
          if (isSelectable) {
            setExpendedItems((prev) => [...(prev ?? []), ...newPath])
          } else {
            if (newPath.includes(currentElement.id)) {
              newPath.pop()
              setExpendedItems((prev) => [...(prev ?? []), ...newPath])
            }
          }
          return
        }
        if (isSelectable && currentElement.children && currentElement.children.length > 0) {
          currentElement.children.forEach((child) => {
            findParent(child, newPath)
          })
        }
      }
      elements_.forEach((element) => {
        findParent(element)
      })
    }, [])

    useEffect(() => {
      if (initialSelectedId) {
        expandSpecificTargetedElements(elements, initialSelectedId)
      }
    }, [initialSelectedId, elements, expandSpecificTargetedElements])

    const direction = dir === 'rtl' ? 'rtl' : 'ltr'

    return (
      <TreeContext.Provider
        value={{
          selectedId,
          expendedItems,
          handleExpand,
          selectItem,
          setExpendedItems,
          indicator,
          openIcon,
          closeIcon,
          direction
        }}
      >
        <div className={cn('size-full', className)}>
          <ScrollArea
            ref={ref}
            className='relative h-full px-2'
            dir={dir as Direction}
          >
            <AccordionPrimitive.Root
              {...props}
              type='multiple'
              defaultValue={expendedItems}
              value={expendedItems}
              className='flex flex-col' // gap-1
              onValueChange={(value) => setExpendedItems((prev) => [...(prev ?? []), value[0]])}
              dir={dir as Direction}
            >
              {children}
            </AccordionPrimitive.Root>
          </ScrollArea>
        </div>
      </TreeContext.Provider>
    )
  }
)

Tree.displayName = 'Tree'

const TreeIndicator = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(({className, ...props}, ref) => {
  const {direction} = useTree()

  return (
    <div
      dir={direction}
      ref={ref}
      className={cn(
        'absolute left-1.5 h-full w-px rounded-md bg-black py-3 duration-300 ease-in-out hover:bg-slate-300 rtl:right-1.5',
        className
      )}
      {...props}
    />
  )
})

TreeIndicator.displayName = 'TreeIndicator'

interface FolderComponentProps extends React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Item> {}

type FolderProps = {
  expendedItems?: string[]
  element: string
  isSelectable?: boolean
  isSelect?: boolean
  indentLevel: number
} & FolderComponentProps

const Folder = forwardRef<HTMLDivElement, FolderProps & React.HTMLAttributes<HTMLDivElement>>(
  ({className, element, value, isSelectable = true, isSelect, children, indentLevel, ...props}, ref) => {
    const {direction, handleExpand, expendedItems, indicator, setExpendedItems, openIcon, closeIcon} = useTree()

    return (
      <AccordionPrimitive.Item
        {...props}
        value={value}
        className='line-height-0 flex-1'
      >
        <AccordionPrimitive.Trigger
          className={cn(`w-full items-center ${0 && 'gap-1'} rounded-md text-sm`, className, {
            'rounded-md bg-muted': isSelect && isSelectable,
            'cursor-pointer': isSelectable,
            'cursor-not-allowed opacity-50': !isSelectable
          })}
          disabled={!isSelectable}
          onClick={() => handleExpand(value)}
        >
          <ItemRow
            element={element}
            size='32 B'
            permissions='drwxrwxrwx'
            uid={`${getRandomVariableDigitNumber()}`}
            gid={`${getRandomVariableDigitNumber()}`}
            indentLevel={indentLevel}
            icon={
              expendedItems?.includes(value)
                ? openIcon ?? <FolderOpenIcon className='h-4 w-4' />
                : closeIcon ?? <FolderIcon className='h-4 w-4' />
            }
          />
          {/* <span className='flex justify-between font-mono'>
            drwxrwxrwx&nbsp;&nbsp;&nbsp;{getRandomVariableDigitNumber()}:{getRandomVariableDigitNumber()}
            &nbsp;&nbsp;Size: 32B
          </span>

          <span className={`flex ${0 && 'gap-1'} font-mono`}>
            {'\xa0'.repeat(indentLevel * 2)}
            {expendedItems?.includes(value)
              ? openIcon ?? <FolderOpenIcon className='h-4 w-4' />
              : closeIcon ?? <FolderIcon className='h-4 w-4' />}
            {element}
          </span> */}
        </AccordionPrimitive.Trigger>
        <AccordionPrimitive.Content className='relative h-full overflow-hidden text-sm data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down'>
          {/* {element && indicator && <TreeIndicator aria-hidden='true' />} */}
          <AccordionPrimitive.Root
            dir={direction}
            type='multiple'
            className='flex flex-col  ' // ml-5 gap-1 py-1 rtl:mr-5
            defaultValue={expendedItems}
            value={expendedItems}
            onValueChange={(value_) => {
              setExpendedItems?.((prev) => [...(prev ?? []), value_[0]])
            }}
          >
            {children}
          </AccordionPrimitive.Root>
        </AccordionPrimitive.Content>
      </AccordionPrimitive.Item>
    )
  }
)

Folder.displayName = 'Folder'

function getRandomVariableDigitNumber() {
  // Choose a random number of digits between 0 and 5
  const digits = Math.floor(Math.random() * 6)

  // If digits is 0, return 0
  if (digits === 0) return 0

  // Generate a random number between 10^(digits-1) and 10^digits - 1
  const min = Math.pow(10, digits - 1)
  const max = Math.pow(10, digits) - 1
  return Math.floor(Math.random() * (max - min + 1) + min)
}

const File = forwardRef<
  HTMLButtonElement,
  {
    value: string
    handleSelect?: (id: string) => void
    isSelectable?: boolean
    isSelect?: boolean
    fileIcon?: React.ReactNode
    elementName: string
    indentLevel: number
  } & React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Trigger>
>(
  (
    {
      value,
      className,
      handleSelect,
      isSelectable = true,
      isSelect,
      fileIcon,
      children,
      elementName,
      indentLevel,
      ...props
    },
    ref
  ) => {
    const {direction, selectedId, selectItem} = useTree()
    const isSelected = isSelect ?? selectedId === value
    return (
      <AccordionPrimitive.Item
        value={value}
        className='line-height-0'
      >
        <AccordionPrimitive.Trigger
          ref={ref}
          {...props}
          dir={direction}
          disabled={!isSelectable}
          aria-label='File'
          className={cn(
            `w-full cursor-pointer items-center gap-1 rounded-md ${0 && 'pr-1'} text-sm duration-200 ease-in-out  ${0 && 'rtl:pl-1 rtl:pr-0'}`,
            {
              'bg-muted': isSelected && isSelectable
            },
            isSelectable ? 'cursor-pointer' : 'cursor-not-allowed opacity-50',
            className
          )}
          onClick={() => selectItem(value)}
        >
          <ItemRow
            element={elementName}
            size='32212 GB'
            permissions='drwxrwxrwx'
            uid={`${getRandomVariableDigitNumber()}`}
            gid={`${getRandomVariableDigitNumber()}`}
            indentLevel={indentLevel}
            icon={fileIcon ?? <FileIcon className='h-4 w-4' />}
          />
          {/* <span className='flex justify-between text-nowrap font-mono'>
            drwxrwxrwx&nbsp;&nbsp;&nbsp;{getRandomVariableDigitNumber()}:{getRandomVariableDigitNumber()}
            &nbsp;&nbsp;Size: 32B
          </span>

          <span className='flex text-nowrap font-mono'>
            {'\xa0'.repeat(indentLevel * 2)}
            {fileIcon ?? <FileIcon className='h-4 w-4' />}
            {elementName}
          </span> */}
        </AccordionPrimitive.Trigger>
      </AccordionPrimitive.Item>
    )
  }
)

interface ItemRowProps {
  element: string
  size: string
  permissions: string
  uid: string
  indentLevel: number
  gid: string
  icon: ReactNode
}

function ItemRow(props: ItemRowProps) {
  return (
    <div
      className='grid text-nowrap font-mono'
      style={{
        gridTemplateColumns: 'minmax(7rem, auto) minmax(7rem, auto) minmax(7rem, auto) 1fr'
      }}
    >
      <div className='col-span-1 text-left '>{props.permissions}</div>
      <div className='col-span-1  text-center '>{`${props.uid}:${props.gid}`}</div>
      <div className='col-span-1 text-center '>{props.size}</div>
      <div className='col-span-1 flex text-left'>
        {'\xa0'.repeat(props.indentLevel * 2 + 2)}
        {props.icon}
        {props.element}
      </div>
    </div>
  )
}

File.displayName = 'File'

const CollapseButton = forwardRef<
  HTMLButtonElement,
  {
    elements: TreeViewElement[]
    expandAll?: boolean
  } & React.HTMLAttributes<HTMLButtonElement>
>(({className, elements, expandAll = false, children, ...props}, ref) => {
  const {expendedItems, setExpendedItems} = useTree()

  const expendAllTree = useCallback(
    (elements_: TreeViewElement[]) => {
      const expandTree = (element: TreeViewElement) => {
        const isSelectable = element.isSelectable ?? true
        if (isSelectable && element.children && element.children.length > 0) {
          setExpendedItems?.((prev) => [...(prev ?? []), element.id])
          element.children.forEach(expandTree)
        }
      }

      elements_.forEach(expandTree)
    },
    [setExpendedItems]
  )

  const closeAll = useCallback(() => {
    setExpendedItems?.([])
  }, [setExpendedItems])

  useEffect(() => {
    // console.log(expandAll)
    if (expandAll) {
      expendAllTree(elements)
    }
  }, [expandAll, elements, expendAllTree])

  return (
    <Button
      variant={'ghost'}
      className='absolute bottom-1 right-2 h-8 w-fit p-1'
      onClick={expendedItems && expendedItems.length > 0 ? closeAll : () => expendAllTree(elements)}
      ref={ref}
      {...props}
    >
      {children}
      <span className='sr-only'>Toggle</span>
    </Button>
  )
})

CollapseButton.displayName = 'CollapseButton'

export {Tree, Folder, File, CollapseButton, type TreeViewElement}
