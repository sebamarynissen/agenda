import createDebugger from "debug";
import { Agenda } from ".";

const debug = createDebugger("agenda:stop");

/**
 * Clear the interval that processes the jobs
 * @name Agenda#stop
 * @function
 * @returns resolves when job unlocking fails or passes
 */
export const stop = async function (this: Agenda): Promise<void> {
  /**
   * Internal method to unlock jobs so that they can be re-run
   * NOTE: May need to update what properties get set here, since job unlocking seems to fail
   * @access private
   * @returns resolves when job unlocking fails or passes
   */
  const _unlockJobs = async (): Promise<void> => {
    debug("Agenda._unlockJobs()");
    const jobIds = this._lockedJobs.map((job) => job.attrs._id);

    if (jobIds.length === 0) {
      debug("no jobs to unlock");
      return;
    }

    debug("about to unlock jobs with ids: %O", jobIds);
    try {
      await this._collection.updateMany(
        { _id: { $in: jobIds } },
        { $set: { lockedAt: null } }
      );
    } finally {
      this._lockedJobs = [];
    }
  };

  debug("Agenda.stop called, clearing interval for processJobs()");
  clearInterval(this._processInterval);
  this._processInterval = undefined;
  return _unlockJobs();
};
