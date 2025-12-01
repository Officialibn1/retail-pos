import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CheckoutDialogV2 } from "../checkout-dialog-v2";
import type { SaleItem } from "@/lib/types";
import { Prisma } from "@/generated/prisma/client";

/**
 * Unit Tests for CheckoutDialogV2 Component
 * Tests that all order summary fields are displayed and both action buttons are present
 * **Validates: Requirements 2.1, 2.2**
 */

describe("CheckoutDialogV2", () => {
	const mockSaleItems: SaleItem[] = [
		{
			id: "item-1",
			quantity: 2,
			price: new Prisma.Decimal(100),
			saleId: "sale-1",
			inventoryItemId: "inv-1",
		},
		{
			id: "item-2",
			quantity: 1,
			price: new Prisma.Decimal(50),
			saleId: "sale-1",
			inventoryItemId: "inv-2",
		},
	];

	const defaultProps = {
		open: true,
		onOpenChange: jest.fn(),
		saleId: "sale-123",
		items: mockSaleItems,
		subtotal: 250,
		discount: 25,
		tax: 22.5,
		total: 247.5,
		onCompletePayment: jest.fn(),
		onClose: jest.fn(),
	};

	beforeEach(() => {
		jest.clearAllMocks();
	});

	/**
	 * Test: All order summary fields are displayed
	 * **Validates: Requirements 2.1**
	 */
	it("should display all order summary fields including item count, subtotal, discount, tax, and total", () => {
		render(<CheckoutDialogV2 {...defaultProps} />);

		// Check item count is displayed
		expect(screen.getByText(/Items \(2\):/)).toBeInTheDocument();

		// Check subtotal is displayed
		expect(screen.getByTestId("checkout-subtotal")).toHaveTextContent(
			"₦250.00",
		);

		// Check discount is displayed
		expect(screen.getByTestId("checkout-discount")).toHaveTextContent(
			"-₦25.00",
		);

		// Check tax is displayed
		expect(screen.getByTestId("checkout-tax")).toHaveTextContent("₦22.50");

		// Check total is displayed
		expect(screen.getByTestId("checkout-total")).toHaveTextContent("₦247.50");
	});

	/**
	 * Test: Both action buttons are present
	 * **Validates: Requirements 2.2**
	 */
	it("should display both 'Complete Payment' and 'Close' buttons", () => {
		render(<CheckoutDialogV2 {...defaultProps} />);

		// Check Complete Payment button is present
		const completePaymentButton = screen.getByTestId("complete-payment-button");
		expect(completePaymentButton).toBeInTheDocument();
		expect(completePaymentButton).toHaveTextContent("Complete Payment");

		// Check Close button is present
		const closeButton = screen.getByTestId("close-button");
		expect(closeButton).toBeInTheDocument();
		expect(closeButton).toHaveTextContent("Close");
	});

	/**
	 * Test: Complete Payment button triggers correct callback
	 */
	it("should call onCompletePayment with saleId when Complete Payment button is clicked", async () => {
		const user = userEvent.setup();
		render(<CheckoutDialogV2 {...defaultProps} />);

		const completePaymentButton = screen.getByTestId("complete-payment-button");
		await user.click(completePaymentButton);

		expect(defaultProps.onCompletePayment).toHaveBeenCalledTimes(1);
		expect(defaultProps.onCompletePayment).toHaveBeenCalledWith("sale-123");
	});

	/**
	 * Test: Close button triggers correct callbacks
	 */
	it("should call onClose and onOpenChange when Close button is clicked", async () => {
		const user = userEvent.setup();
		render(<CheckoutDialogV2 {...defaultProps} />);

		const closeButton = screen.getByTestId("close-button");
		await user.click(closeButton);

		expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
		expect(defaultProps.onOpenChange).toHaveBeenCalledWith(false);
	});

	/**
	 * Test: Order summary without discount
	 */
	it("should not display discount row when discount is zero", () => {
		const propsWithoutDiscount = {
			...defaultProps,
			discount: 0,
		};

		render(<CheckoutDialogV2 {...propsWithoutDiscount} />);

		// Discount row should not be present
		expect(screen.queryByTestId("checkout-discount")).not.toBeInTheDocument();
	});

	/**
	 * Test: Dialog displays correct title and description
	 */
	it("should display correct dialog title and description", () => {
		render(<CheckoutDialogV2 {...defaultProps} />);

		expect(screen.getByText("Order Summary")).toBeInTheDocument();
		expect(screen.getByText(/Review your order details/)).toBeInTheDocument();
	});

	/**
	 * Test: Buttons are disabled when processing
	 * **Validates: Requirements 8.2**
	 */
	it("should disable buttons when isProcessing is true", () => {
		const propsWithProcessing = {
			...defaultProps,
			isProcessing: true,
		};

		render(<CheckoutDialogV2 {...propsWithProcessing} />);

		const completePaymentButton = screen.getByTestId("complete-payment-button");
		const closeButton = screen.getByTestId("close-button");

		expect(completePaymentButton).toBeDisabled();
		expect(closeButton).toBeDisabled();
	});

	/**
	 * Test: Loading indicator is shown when processing
	 * **Validates: Requirements 8.2**
	 */
	it("should show loading indicator when isProcessing is true", () => {
		const propsWithProcessing = {
			...defaultProps,
			isProcessing: true,
		};

		render(<CheckoutDialogV2 {...propsWithProcessing} />);

		const completePaymentButton = screen.getByTestId("complete-payment-button");
		expect(completePaymentButton).toHaveTextContent("Processing...");
	});
});
