/**
 * Component story registry — auto-generated.
 * Import this to get all available stories for the playground.
 */
import { buttonStory } from './button.story';
import { fabStory } from './fab.story';
import { badgeStory } from './badge.story';
import { chipStory } from './chip.story';
import { toggleStory } from './toggle.story';
import { togglegroupStory } from './togglegroup.story';
import { inputStory } from './input.story';
import { selectStory } from './select.story';
import { textareaStory } from './textarea.story';
import { datepickerStory } from './datepicker.story';
import { checkboxStory } from './checkbox.story';
import { radioStory } from './radio.story';
import { switchStory } from './switch.story';
import { comboboxStory } from './combobox.story';
import { sliderStory } from './slider.story';
import { fileuploadStory } from './fileupload.story';
import { inputotpStory } from './inputotp.story';
import { labelStory } from './label.story';
import { helpertextStory } from './helpertext.story';
import { formfieldStory } from './formfield.story';
import { calendarStory } from './calendar.story';
import { cardStory } from './card.story';
import { dialogStory } from './dialog.story';
import { tableStory } from './table.story';
import { sheetStory } from './sheet.story';
import { separatorStory } from './separator.story';
import { alertdialogStory } from './alertdialog.story';
import { toastStory } from './toast.story';
import { alertStory } from './alert.story';
import { tooltipStory } from './tooltip.story';
import { popoverStory } from './popover.story';
import { dropdownmenuStory } from './dropdownmenu.story';
import { skeletonStory } from './skeleton.story';
import { progressbarStory } from './progressbar.story';
import { badgedotStory } from './badgedot.story';
import { emptystateStory } from './emptystate.story';
import { contextmenuStory } from './contextmenu.story';
import { hovercardStory } from './hovercard.story';
import { spinnerStory } from './spinner.story';
import { avatarStory } from './avatar.story';
import { listitemStory } from './listitem.story';
import { accordionStory } from './accordion.story';
import { kbdStory } from './kbd.story';
import { collapsibleStory } from './collapsible.story';
import { topbarStory } from './topbar.story';
import { sidebarStory } from './sidebar.story';
import { tabsStory } from './tabs.story';
import { bottomnavStory } from './bottomnav.story';
import { breadcrumbsStory } from './breadcrumbs.story';
import { paginationStory } from './pagination.story';
import { navigationmenuStory } from './navigationmenu.story';
import { commandpaletteStory } from './commandpalette.story';
import { stepperStory } from './stepper.story';
import { carouselStory } from './carousel.story';
import { treeviewStory } from './treeview.story';

export const stories = {
  'button': buttonStory,
  'fab': fabStory,
  'badge': badgeStory,
  'chip': chipStory,
  'toggle': toggleStory,
  'toggle-group': togglegroupStory,
  'input': inputStory,
  'select': selectStory,
  'textarea': textareaStory,
  'date-picker': datepickerStory,
  'checkbox': checkboxStory,
  'radio': radioStory,
  'switch': switchStory,
  'combobox': comboboxStory,
  'slider': sliderStory,
  'file-upload': fileuploadStory,
  'input-otp': inputotpStory,
  'label': labelStory,
  'helper-text': helpertextStory,
  'form-field': formfieldStory,
  'calendar': calendarStory,
  'card': cardStory,
  'dialog': dialogStory,
  'table': tableStory,
  'sheet': sheetStory,
  'separator': separatorStory,
  'alert-dialog': alertdialogStory,
  'toast': toastStory,
  'alert': alertStory,
  'tooltip': tooltipStory,
  'popover': popoverStory,
  'dropdown-menu': dropdownmenuStory,
  'skeleton': skeletonStory,
  'progress-bar': progressbarStory,
  'badge-dot': badgedotStory,
  'empty-state': emptystateStory,
  'context-menu': contextmenuStory,
  'hover-card': hovercardStory,
  'spinner': spinnerStory,
  'avatar': avatarStory,
  'list-item': listitemStory,
  'accordion': accordionStory,
  'kbd': kbdStory,
  'collapsible': collapsibleStory,
  'top-bar': topbarStory,
  'sidebar': sidebarStory,
  'tabs': tabsStory,
  'bottom-nav': bottomnavStory,
  'breadcrumbs': breadcrumbsStory,
  'pagination': paginationStory,
  'navigation-menu': navigationmenuStory,
  'command-palette': commandpaletteStory,
  'stepper': stepperStory,
  'carousel': carouselStory,
  'tree-view': treeviewStory,
};

export type StoryKey = keyof typeof stories;

export const storyCategories = {
  'Actions': ['button', 'fab', 'badge', 'chip', 'toggle', 'toggle-group'],
  'Inputs': ['input', 'select', 'textarea', 'date-picker', 'checkbox', 'radio', 'switch', 'combobox', 'slider', 'file-upload', 'input-otp', 'label', 'helper-text', 'form-field', 'calendar'],
  'Layout': ['card', 'dialog', 'table', 'sheet', 'separator', 'alert-dialog'],
  'Feedback': ['toast', 'alert', 'tooltip', 'popover', 'dropdown-menu', 'skeleton', 'progress-bar', 'badge-dot', 'empty-state', 'context-menu', 'hover-card', 'spinner'],
  'Data Display': ['avatar', 'list-item', 'accordion', 'kbd', 'collapsible'],
  'Navigation': ['top-bar', 'sidebar', 'tabs', 'bottom-nav', 'breadcrumbs', 'pagination', 'navigation-menu', 'command-palette'],
  'Composite': ['stepper', 'carousel', 'tree-view'],
} as const;
