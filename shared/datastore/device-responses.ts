import dayjs from "dayjs";
import { DeviceKind } from ".";
import { BehaviorBiometricsPerFlow, BiometricField, DeviceProfile } from "../device_intelligence";
import { BehaviorBiometrics, BField } from "./device-schema";

const DATETIME = "YYYY-MM-DD HH:mm:ss";

export const convertDeviceKindToProfile = (device: DeviceKind): DeviceProfile => {
  const { behavior_biometrics, created_at, ip_location, timestamp, updated_at } = device;

  return {
    ...device,
    behavior_biometrics: behavior_biometrics
      ? behavior_biometrics.map((b: BehaviorBiometrics) => convertBBiometricsToBBiometricsPerFlow(b))
      : [],
    created_at: dayjs(created_at).format(DATETIME),
    fraud_score: 0,
    location: {
      lat: ip_location.latitude,
      lon: ip_location.longitude,
    },
    datetime: dayjs(timestamp).format(DATETIME),
    updated_at: dayjs(updated_at).format(DATETIME),
  };
};

export const convertBBiometricsToBBiometricsPerFlow = (biometrics: BehaviorBiometrics): BehaviorBiometricsPerFlow => {
  const { fields, hesitation_percentile, num_context_switches } = biometrics;

  return {
    ...biometrics,
    fields: fields ? fields.map((f) => convertFieldToBiometricField(f)) : [],
    hesitations_percentage: {
      amount: hesitation_percentile.non_ltm,
      ltm: hesitation_percentile.ltm,
    },
    num_context_switch_events: num_context_switches,
  };
};

export const convertFieldToBiometricField = (field: BField): BiometricField => {
  const { hesitation_percentage, num_auto_fill_events, num_clipboard_events, num_copy_paste_events, num_expert_key_events } =
    field;

  return {
    ...field,
    hesitation_percentage: Number(hesitation_percentage) || 0,
    num_auto_fill_events: Number(num_auto_fill_events),
    num_clipboard_events: Number(num_clipboard_events),
    num_copy_paste_events: Number(num_copy_paste_events),
    num_expert_key_events: Number(num_expert_key_events),
  };
};
