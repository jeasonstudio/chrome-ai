export enum ChromeAICapabilityAvailability {
  /**
   * the device or browser does not support prompting a language model at all
   */
  NO = 'no',
  /**
   * the device or browser supports prompting a language model, but it needs to be downloaded before it can be used
   */
  AFTER_DOWNLOAD = 'after-download',
  /**
   * the device or browser supports prompting a language model and it’s ready to be used without any downloading steps
   */
  READILY = 'readily',
}
