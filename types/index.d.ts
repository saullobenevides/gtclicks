/**
 * Tipos base compartilhados da plataforma GTClicks
 * Extensões e tipos globais
 */

/** Componentes UI em .jsx sem tipos explícitos - declarações para compatibilidade TS */
declare module "@/components/ui/avatar" {
  export const Avatar: React.FC<{
    children?: React.ReactNode;
    className?: string;
  }>;
  export const AvatarImage: React.FC<{
    src?: string | null;
    alt?: string;
    className?: string;
  }>;
  export const AvatarFallback: React.FC<{
    children?: React.ReactNode;
    className?: string;
  }>;
}

declare module "@/components/ui/badge" {
  export const Badge: React.FC<{
    children?: React.ReactNode;
    className?: string;
    variant?: string;
    onClick?: () => void;
  }>;
  export const badgeVariants: (props?: unknown) => string;
}

declare module "@/components/ui/button" {
  export const Button: React.ForwardRefExoticComponent<
    React.ComponentPropsWithRef<"button"> & {
      asChild?: boolean;
      variant?: string;
      size?: string;
      children?: React.ReactNode;
    }
  >;
  export const buttonVariants: (props?: unknown) => string;
}

declare module "@/components/ui/card" {
  const Card: React.ForwardRefExoticComponent<
    React.ComponentPropsWithRef<"div"> & {
      className?: string;
      children?: React.ReactNode;
    }
  >;
  const CardHeader: React.ForwardRefExoticComponent<
    React.ComponentPropsWithRef<"div"> & {
      className?: string;
      children?: React.ReactNode;
    }
  >;
  const CardTitle: React.ForwardRefExoticComponent<
    React.ComponentPropsWithRef<"div"> & {
      className?: string;
      children?: React.ReactNode;
    }
  >;
  const CardDescription: React.ForwardRefExoticComponent<
    React.ComponentPropsWithRef<"div"> & {
      className?: string;
      children?: React.ReactNode;
    }
  >;
  const CardContent: React.ForwardRefExoticComponent<
    React.ComponentPropsWithRef<"div"> & {
      className?: string;
      children?: React.ReactNode;
    }
  >;
  const CardFooter: React.ForwardRefExoticComponent<
    React.ComponentPropsWithRef<"div"> & {
      className?: string;
      children?: React.ReactNode;
    }
  >;
  export {
    Card,
    CardHeader,
    CardTitle,
    CardDescription,
    CardContent,
    CardFooter,
  };
}

declare module "@/components/ui/separator" {
  export const Separator: React.ForwardRefExoticComponent<
    React.ComponentPropsWithRef<"div"> & {
      className?: string;
      orientation?: "horizontal" | "vertical";
      decorative?: boolean;
      children?: React.ReactNode;
    }
  >;
}

/** Layout components - props flexíveis para compatibilidade */
declare module "@/components/shared/layout" {
  export const PageBreadcrumbs: React.FC<{
    items?: Array<{ label: string; href?: string; isLast?: boolean }>;
    className?: string;
  }>;
  export const PageSection: React.FC<{
    children?: React.ReactNode;
    variant?: "default" | "hero" | "compact";
    containerWide?: boolean;
    className?: string;
  }>;
  export const SectionHeader: React.FC<{
    title?: React.ReactNode;
    description?: string;
    badge?: string;
    align?: "left" | "center";
    size?: "default" | "large";
    isLanding?: boolean;
    className?: string;
  }>;
  export const ResponsiveGrid: React.FC<{
    children?: React.ReactNode;
    cols?: { sm?: number; md?: number; lg?: number; xl?: number };
    gap?: number;
    loading?: boolean;
    empty?: React.ReactNode;
    className?: string;
  }>;
}

declare module "@/components/shared/actions/ShareButton" {
  const ShareButton: React.FC<{
    title?: string;
    text?: string;
    url?: string;
    className?: string;
    variant?: string;
    size?: string;
    children?: React.ReactNode;
  }>;
  export default ShareButton;
}

declare module "@/components/shared/actions" {
  export const ActionButton: React.FC<{
    children?: React.ReactNode;
    onAction?: () => void | Promise<void>;
    requireConfirm?: boolean;
    confirmMessage?: string;
    successMessage?: string;
    errorMessage?: string;
    disabled?: boolean;
    variant?: string;
    size?: string;
    className?: string;
  }>;
}

declare module "@/components/shared/Badge" {
  const Badge: React.FC<{
    children?: React.ReactNode;
    variant?: string;
    size?: string;
    icon?: React.ComponentType<{ className?: string }>;
    onRemove?: () => void;
    className?: string;
  }>;
  export default Badge;
}

declare module "@/components/shared/layout/PageContainer" {
  const PageContainer: React.FC<{
    children?: React.ReactNode;
    className?: string;
  }>;
  export default PageContainer;
}

declare module "@/features/collections/context/SelectionContext" {
  import type { Context } from "react";
  export const SelectionContext: Context<{
    selectedIds: Set<string>;
    toggleSelection: (id: string) => void;
    isSelectionMode?: boolean;
  }>;
  export const useSelection: () => {
    selectedIds: Set<string>;
    toggleSelection: (id: string) => void;
    isSelectionMode?: boolean;
  };
}

declare module "@/features/collections/components/CollectionSearchClient" {
  const CollectionSearchClient: React.FC<{
    allPhotos?: unknown[];
    collectionId?: string;
    collectionTitle?: string;
    initialDisplayPhotos?: unknown[];
    children?: React.ReactNode;
  }>;
  export default CollectionSearchClient;
}

declare module "@/features/photographer/components/PhotographerFilters" {
  const PhotographerFilters: React.FC<{
    filters?: Record<string, string | number>;
    cities?: string[];
  }>;
  export default PhotographerFilters;
}

declare module "@/features/collections/components/SearchFilters" {
  const SearchFilters: React.FC<{
    filters?: Record<string, string | number>;
    cities?: string[];
  }>;
  export default SearchFilters;
}

declare module "@/features/photographer/components/FotografoOnboarding" {
  const FotografoOnboarding: React.FC<{
    onSuccess?: (data?: unknown) => void;
  }>;
  export default FotografoOnboarding;
}

declare module "@/components/shared/layout/PageHeader" {
  const PageHeader: React.FC<{
    children?: React.ReactNode;
    backgroundImage?: string | null;
    variant?: string;
    overlayOpacity?: string;
    title?: string;
  }>;
  export default PageHeader;
}

declare module "@/components/shared/BackButton" {
  const BackButton: React.FC<{
    href?: string;
    className?: string;
    label?: string;
  }>;
  export default BackButton;
}

declare module "@/components/ui/accordion" {
  export const Accordion: React.FC<{
    type?: "single" | "multiple";
    collapsible?: boolean;
    className?: string;
    children?: React.ReactNode;
  }>;
  export const AccordionItem: React.ForwardRefExoticComponent<
    React.ComponentPropsWithRef<"div"> & {
      value: string;
      className?: string;
      children?: React.ReactNode;
    }
  >;
  export const AccordionTrigger: React.ForwardRefExoticComponent<
    React.ComponentPropsWithRef<"button"> & {
      className?: string;
      children?: React.ReactNode;
    }
  >;
  export const AccordionContent: React.ForwardRefExoticComponent<
    React.ComponentPropsWithRef<"div"> & {
      className?: string;
      children?: React.ReactNode;
    }
  >;
}

declare module "@/components/ui/tabs" {
  export const Tabs: React.FC<{
    children?: React.ReactNode;
    defaultValue?: string;
    value?: string;
    onValueChange?: (v: string) => void;
    className?: string;
  }>;
  export const TabsList: React.FC<{
    children?: React.ReactNode;
    className?: string;
    role?: string;
    "aria-label"?: string;
  }>;
  export const TabsTrigger: React.FC<{
    children?: React.ReactNode;
    value: string;
    className?: string;
  }>;
  export const TabsContent: React.FC<{
    children?: React.ReactNode;
    value: string;
    className?: string;
  }>;
}

declare module "@/components/ui/dialog" {
  export const Dialog: React.FC<{
    children?: React.ReactNode;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
  }>;
  export const DialogOverlay: React.ForwardRefExoticComponent<
    React.ComponentPropsWithRef<"div"> & { className?: string }
  >;
  export const DialogTrigger: React.FC<{
    children?: React.ReactNode;
    asChild?: boolean;
  }>;
  export const DialogContent: React.FC<{
    children?: React.ReactNode;
    className?: string;
    overlayClassName?: string;
    "aria-describedby"?: string | undefined;
  }>;
  export const DialogHeader: React.FC<{
    children?: React.ReactNode;
    className?: string;
  }>;
  export const DialogFooter: React.FC<{
    children?: React.ReactNode;
    className?: string;
  }>;
  export const DialogTitle: React.FC<{
    children?: React.ReactNode;
    className?: string;
  }>;
  export const DialogDescription: React.FC<{
    children?: React.ReactNode;
    className?: string;
  }>;
}

declare module "@/components/shared/states" {
  export const EmptyState: React.FC<{
    icon?: React.ComponentType;
    title?: string;
    description?: string;
    action?: { label: string; href?: string; onClick?: () => void };
    variant?: string;
    illustration?: string;
    className?: string;
  }>;
  export const ErrorState: React.FC<{
    title?: string;
    message?: string;
    onRetry?: () => void;
    variant?: string;
    className?: string;
  }>;
  export const LoadingState: React.FC<{
    variant?: string;
    size?: string;
    message?: string;
    count?: number;
    className?: string;
  }>;
}

declare module "@/components/shared/cards/PhotoCard" {
  const PhotoCard: React.FC<{
    photo: unknown;
    variant?: "default" | "compact" | "large" | "centered-hover";
    contextList?: unknown[];
    showSelection?: boolean;
    showQuickAdd?: boolean;
    priority?: boolean;
    customActions?: React.ReactNode;
    onAddToCart?: (photo: unknown) => void;
    onSelect?: (id: string) => void;
    isSelected?: boolean;
    className?: string;
  }>;
  export default PhotoCard;
}

declare module "@/components/ui/popover" {
  export const Popover: React.FC<{
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    children?: React.ReactNode;
  }>;
  export const PopoverTrigger: React.ForwardRefExoticComponent<
    React.ComponentPropsWithRef<"button"> & {
      asChild?: boolean;
      children?: React.ReactNode;
    }
  >;
  export const PopoverContent: React.ForwardRefExoticComponent<
    React.ComponentPropsWithRef<"div"> & {
      align?: "start" | "center" | "end";
      sideOffset?: number;
      className?: string;
      children?: React.ReactNode;
    }
  >;
}

declare module "@/components/shared/cards/CollectionCard" {
  const CollectionCard: React.FC<{
    collection: unknown;
    variant?: "default" | "compact" | "featured";
    showPhotographer?: boolean;
    showDate?: boolean;
    showDescription?: boolean;
    showPrice?: boolean;
    badges?: unknown[];
    className?: string;
  }>;
  export default CollectionCard;
}

declare module "@/components/shared/cards" {
  export { default as PhotoCard } from "./PhotoCard";
  export { default as CollectionCard } from "./CollectionCard";
  export { default as FeatureCard } from "./FeatureCard";
  export { default as IconCard } from "./IconCard";
}

declare module "@/components/shared/StandardFaq" {
  const StandardFaq: React.FC<{
    items: Array<{ question: string; answer: string }>;
  }>;
  export default StandardFaq;
}

declare module "@/components/shared/ImageWithFallback" {
  const ImageWithFallback: React.FC<{
    src?: string | null;
    alt?: string;
    className?: string;
    imageClassName?: string;
    sizes?: string;
    priority?: boolean;
    fill?: boolean;
    width?: number;
    height?: number;
    quality?: number;
  }>;
  export default ImageWithFallback;
}

/** Table components */
declare module "@/components/ui/table" {
  export const Table: React.FC<{
    children?: React.ReactNode;
    className?: string;
  }>;
  export const TableHeader: React.FC<{
    children?: React.ReactNode;
    className?: string;
  }>;
  export const TableBody: React.FC<{ children?: React.ReactNode }>;
  export const TableRow: React.FC<{
    children?: React.ReactNode;
    className?: string;
  }>;
  export const TableHead: React.FC<{
    children?: React.ReactNode;
    className?: string;
  }>;
  export const TableCell: React.FC<{
    children?: React.ReactNode;
    className?: string;
    colSpan?: number;
  }>;
}

/** Alert components */
declare module "@/components/ui/alert" {
  export const Alert: React.FC<{
    children?: React.ReactNode;
    variant?: "default" | "destructive" | "warning";
    className?: string;
  }>;
  export const AlertTitle: React.FC<{ children?: React.ReactNode }>;
  export const AlertDescription: React.FC<{
    children?: React.ReactNode;
    className?: string;
  }>;
}

/** Input, Label */
declare module "@/components/ui/input" {
  const Input: React.ForwardRefExoticComponent<
    React.ComponentPropsWithRef<"input"> & { className?: string }
  >;
  export { Input };
}

declare module "@/components/ui/checkbox" {
  export const Checkbox: React.ForwardRefExoticComponent<
    React.ComponentPropsWithRef<"button"> & {
      checked?: boolean;
      onCheckedChange?: (checked: boolean) => void;
      className?: string;
    }
  >;
}

declare module "@/components/ui/textarea" {
  export const Textarea: React.ForwardRefExoticComponent<
    React.ComponentPropsWithRef<"textarea"> & {
      className?: string;
      rows?: number;
      id?: string;
      placeholder?: string;
      value?: string;
      onChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
    }
  >;
}

declare module "@/components/ui/label" {
  export const Label: React.FC<
    React.LabelHTMLAttributes<HTMLLabelElement> & {
      children?: React.ReactNode;
      className?: string;
    }
  >;
}

/** AppPagination - props opcionais para modo URL */
declare module "@/components/shared/AppPagination" {
  const AppPagination: React.FC<{
    currentPage: number;
    totalPages: number;
    baseUrl: string;
    searchParams?: Record<string, string>;
    onPageChange?: (page: number) => void;
    className?: string;
    "aria-label"?: string;
  }>;
  export default AppPagination;
}

/** Carousel */
declare module "@/components/ui/carousel" {
  export const Carousel: React.ForwardRefExoticComponent<
    React.ComponentPropsWithRef<"div"> & {
      orientation?: "horizontal" | "vertical";
      opts?: { align?: string; loop?: boolean; axis?: string };
      setApi?: (api: unknown) => void;
      plugins?: unknown[];
      className?: string;
      children?: React.ReactNode;
    }
  >;
  export const CarouselContent: React.ForwardRefExoticComponent<
    React.ComponentPropsWithRef<"div"> & {
      className?: string;
      children?: React.ReactNode;
    }
  >;
  export const CarouselItem: React.ForwardRefExoticComponent<
    React.ComponentPropsWithRef<"div"> & {
      className?: string;
      children?: React.ReactNode;
    }
  >;
  export const CarouselPrevious: React.ForwardRefExoticComponent<
    React.ComponentPropsWithRef<"button"> & {
      className?: string;
      variant?: string;
      size?: string;
      "aria-label"?: string;
    }
  >;
  export const CarouselNext: React.ForwardRefExoticComponent<
    React.ComponentPropsWithRef<"button"> & {
      className?: string;
      variant?: string;
      size?: string;
      "aria-label"?: string;
    }
  >;
}

/** DropdownMenu */
declare module "@/components/ui/dropdown-menu" {
  export const DropdownMenu: React.FC<{
    children?: React.ReactNode;
  }>;
  export const DropdownMenuTrigger: React.ForwardRefExoticComponent<
    React.ComponentPropsWithRef<"button"> & {
      asChild?: boolean;
      children?: React.ReactNode;
    }
  >;
  export const DropdownMenuContent: React.ForwardRefExoticComponent<
    React.ComponentPropsWithRef<"div"> & {
      align?: "start" | "center" | "end";
      sideOffset?: number;
      className?: string;
      children?: React.ReactNode;
    }
  >;
  export const DropdownMenuItem: React.ForwardRefExoticComponent<
    React.ComponentPropsWithRef<"div"> & {
      asChild?: boolean;
      className?: string;
      inset?: boolean;
      children?: React.ReactNode;
    }
  >;
  export const DropdownMenuLabel: React.ForwardRefExoticComponent<
    React.ComponentPropsWithRef<"div"> & {
      className?: string;
      inset?: boolean;
      children?: React.ReactNode;
    }
  >;
  export const DropdownMenuSeparator: React.ForwardRefExoticComponent<
    React.ComponentPropsWithRef<"div"> & { className?: string }
  >;
}

/** Sheet */
declare module "@/components/ui/sheet" {
  export const Sheet: React.FC<{
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    children?: React.ReactNode;
  }>;
  export const SheetContent: React.ForwardRefExoticComponent<
    React.ComponentPropsWithRef<"div"> & {
      side?: "left" | "right" | "top" | "bottom";
      className?: string;
      id?: string;
      style?: React.CSSProperties;
      "aria-describedby"?: string | undefined;
      children?: React.ReactNode;
    }
  >;
  export const SheetHeader: React.FC<{
    className?: string;
    children?: React.ReactNode;
  }>;
  export const SheetTitle: React.ForwardRefExoticComponent<
    React.ComponentPropsWithRef<"h2"> & { className?: string }
  >;
}

/** Pagination */
declare module "@/components/ui/pagination" {
  export const Pagination: React.FC<{
    className?: string;
    "aria-label"?: string;
    children?: React.ReactNode;
  }>;
  export const PaginationContent: React.ForwardRefExoticComponent<
    React.ComponentPropsWithRef<"ul"> & { className?: string }
  >;
  export const PaginationItem: React.ForwardRefExoticComponent<
    React.ComponentPropsWithRef<"li"> & {
      className?: string;
      children?: React.ReactNode;
    }
  >;
  export const PaginationLink: React.FC<{
    href?: string;
    className?: string;
    isActive?: boolean;
    size?: string;
    children?: React.ReactNode;
  }>;
  export const PaginationButton: React.ForwardRefExoticComponent<
    React.ComponentPropsWithRef<"button"> & {
      className?: string;
      isActive?: boolean;
      size?: string;
      onClick?: () => void;
      children?: React.ReactNode;
    }
  >;
  export const PaginationEllipsis: React.FC<{ className?: string }>;
  export const PaginationPrevious: React.FC<{
    className?: string;
    as?: "link" | "button";
    href?: string;
    onClick?: () => void;
    children?: React.ReactNode;
  }>;
  export const PaginationNext: React.FC<{
    className?: string;
    as?: "link" | "button";
    href?: string;
    onClick?: () => void;
    children?: React.ReactNode;
  }>;
}

/** SortableTableHead */
declare module "@/components/shared/SortableTableHead" {
  export const SortableTableHead: React.FC<{
    field: string;
    sort: string;
    order: string;
    onSort: (field: string) => void;
    className?: string;
    children?: React.ReactNode;
  }>;
}
