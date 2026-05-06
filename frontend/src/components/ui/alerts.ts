import Swal from 'sweetalert2';
import 'sweetalert2/dist/sweetalert2.min.css';

const baseOptions = {
  background: '#ffffff',
  color: '#111111',
  backdrop: 'rgba(13, 13, 13, 0.72)',
  showConfirmButton: true,
  confirmButtonText: 'Entendi',
  buttonsStyling: false,
  showCloseButton: true,
  customClass: {
    popup: 'pitang-swal-popup',
    title: 'pitang-swal-title',
    htmlContainer: 'pitang-swal-content',
    confirmButton: 'pitang-swal-confirm',
    cancelButton: 'pitang-swal-cancel',
  },
};

export const showSuccessAlert = (title: string, text?: string) =>
  Swal.fire({
    ...baseOptions,
    icon: 'success',
    iconColor: '#10a37f',
    title,
    text,
    confirmButtonColor: '#c8102e',
  });

export const showErrorAlert = (title: string, text?: string) =>
  Swal.fire({
    ...baseOptions,
    icon: 'error',
    iconColor: '#d92d20',
    title,
    text,
    confirmButtonColor: '#c8102e',
  });

export const showWarningAlert = (title: string, text?: string) =>
  Swal.fire({
    ...baseOptions,
    icon: 'warning',
    iconColor: '#f7b733',
    title,
    text,
    confirmButtonColor: '#c8102e',
  });

export const showConfirmAlert = (title: string, text: string) =>
  Swal.fire({
    ...baseOptions,
    icon: 'question',
    iconColor: '#c8102e',
    title,
    text,
    showCancelButton: true,
    confirmButtonText: 'Sim, confirmar',
    cancelButtonText: 'Cancelar',
    confirmButtonColor: '#c8102e',
  });
