/**
 * Copyright (c) Streamlit Inc. (2018-2022) Snowflake Inc. (2022-2025)
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import React from "react"

import { screen, waitFor } from "@testing-library/react"
import { userEvent } from "@testing-library/user-event"

import ThemeProvider from "~lib/components/core/ThemeProvider"
import { mockTheme } from "~lib/mocks/mockTheme"
import { render } from "~lib/test_util"

import TooltipIcon, { getHelpTooltipAriaLabel } from "./TooltipIcon"

describe("TooltipIcon element", () => {
  it("renders a TooltipIcon", () => {
    render(
      <ThemeProvider
        theme={mockTheme.emotion}
        baseuiTheme={mockTheme.basewebTheme}
      >
        <TooltipIcon content="" ariaLabel="Help" />
      </ThemeProvider>
    )
    const tooltipIcon = screen.getByTestId("stTooltipIcon")
    expect(tooltipIcon).toBeInTheDocument()
  })

  it("falls back to a default aria-label when ariaLabel is an empty string", async () => {
    const user = userEvent.setup()
    render(
      <ThemeProvider
        theme={mockTheme.emotion}
        baseuiTheme={mockTheme.basewebTheme}
      >
        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any -- Intentionally bypass types to validate runtime safety. */}
        <TooltipIcon content="Help text" ariaLabel={"" as any} />
      </ThemeProvider>
    )

    await user.tab()
    expect(screen.getByRole("button", { name: "Help" })).toHaveFocus()
  })

  it("renders a focusable trigger button by default", async () => {
    const user = userEvent.setup()
    render(
      <ThemeProvider
        theme={mockTheme.emotion}
        baseuiTheme={mockTheme.basewebTheme}
      >
        <TooltipIcon content="Help text" ariaLabel="Help for widget" />
      </ThemeProvider>
    )

    await user.tab()
    expect(
      screen.getByRole("button", { name: "Help for widget" })
    ).toHaveFocus()
  })

  it("shows tooltip content on keyboard focus and closes on blur", async () => {
    const user = userEvent.setup()
    render(
      <ThemeProvider
        theme={mockTheme.emotion}
        baseuiTheme={mockTheme.basewebTheme}
      >
        <TooltipIcon content="Help text" ariaLabel="Help for widget" />
        <button type="button">After</button>
      </ThemeProvider>
    )

    await user.tab()
    expect(
      screen.getByRole("button", { name: "Help for widget" })
    ).toHaveFocus()

    const tooltipContent = await screen.findByTestId("stTooltipContent")
    expect(tooltipContent).toHaveTextContent("Help text")

    // Blur by tabbing to the next focusable element.
    await user.tab()
    expect(screen.getByRole("button", { name: "After" })).toHaveFocus()

    await waitFor(() => {
      expect(screen.queryByTestId("stTooltipContent")).not.toBeInTheDocument()
    })
  })

  it("closes the tooltip on Escape", async () => {
    const user = userEvent.setup()
    render(
      <ThemeProvider
        theme={mockTheme.emotion}
        baseuiTheme={mockTheme.basewebTheme}
      >
        <TooltipIcon content="Help text" ariaLabel="Help for widget" />
      </ThemeProvider>
    )

    await user.tab()
    const trigger = screen.getByRole("button", { name: "Help for widget" })
    expect(trigger).toHaveFocus()
    await screen.findByTestId("stTooltipContent")

    await user.keyboard("{Escape}")
    await waitFor(() => {
      expect(screen.queryByTestId("stTooltipContent")).not.toBeInTheDocument()
    })
    expect(trigger).not.toHaveFocus()
  })

  it("normalizes whitespace in getHelpTooltipAriaLabel", () => {
    expect(getHelpTooltipAriaLabel("  My \n widget\tlabel  ")).toBe(
      "Help for My widget label"
    )
    expect(getHelpTooltipAriaLabel("")).toBe("Help")
    expect(getHelpTooltipAriaLabel(null)).toBe("Help")
  })
})
